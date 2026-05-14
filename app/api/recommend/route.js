import { getRecommendations, GeminiParseError, GeminiUnavailableError } from "@/lib/gemini";
import { searchTrack, SpotifyAuthError, getTopArtists, getTopTracks, getRecentlyPlayed } from "@/lib/spotify";
import { withSpotifyRetry } from "@/lib/spotifyAuth";
import { rateLimit } from "@/lib/rateLimit";
import { getDeezerPreview } from "@/lib/deezer";
import { jsonError, readJsonBody, requireApiSession, rateLimitResponse } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import Settings from "@/models/Settings";
import { mergeWithDefaults } from "@/lib/settings";
import { parseExcludedArtists, isExcludedArtist } from "@/lib/recommendHelpers";

function titleCasePlaylistName(prompt) {
  const trimmed = prompt.trim().slice(0, 60);
  return trimmed
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ") + " Mix";
}

export async function POST(req) {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const { body, response: invalidJson } = await readJsonBody(req);
  if (invalidJson) return invalidJson;

  const prompt = (body?.prompt || "").toString().trim();
  if (!prompt) {
    return jsonError("Prompt is required", 400);
  }
  if (prompt.length > 500) {
    return jsonError("Prompt too long (max 500 chars)", 400);
  }
  const context = body?.context ?? null;
  const rawSeed = body?.seed;
  const seed =
    rawSeed && typeof rawSeed.title === "string" && typeof rawSeed.artist === "string"
      ? { title: rawSeed.title.trim(), artist: rawSeed.artist.trim() }
      : null;
  const rl = rateLimit(`recommend:${session.spotifyId}`, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return rateLimitResponse(rl);
  }

  const excludedArtists = parseExcludedArtists(body);

  // Use a mutable wrapper so withSpotifyRetry can update the access token
  // mid-stream after a 401-driven rotation, and subsequent searches see it.
  const tokenSession = { accessToken: session.accessToken, spotifyId: session.spotifyId };
  const spotifyId = session.spotifyId;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (obj) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
        } catch {}
      };
      const fail = (status, message) => {
        send({ type: "error", status, message });
        controller.close();
      };

      try {
        await connectDB();
        const user = await User.findOne({ spotifyId });

        let settings = mergeWithDefaults(null);
        if (user) {
          const settingsDoc = await Settings.findOne({ userId: user._id }).lean();
          settings = mergeWithDefaults(settingsDoc);
        }

        let excludedSongs = [];
        if (user) {
          const pastPrompts = await Prompt.find(
            { userId: user._id },
            { recommendations: 1, _id: 0 }
          )
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

          for (const p of pastPrompts) {
            for (const r of p.recommendations || []) {
              if (excludedSongs.length >= 200) break;
              if (r.title && r.artist) excludedSongs.push({ title: r.title, artist: r.artist });
            }
            if (excludedSongs.length >= 200) break;
          }
        }

        let personalization = null;
        if (settings.aiTastePersonalization) {
          try {
            const [topArtists, topTracks, recent] = await Promise.all([
              getTopArtists(tokenSession.accessToken, "medium_term", 10),
              getTopTracks(tokenSession.accessToken, "medium_term", 10),
              getRecentlyPlayed(tokenSession.accessToken, 30),
            ]);
            const seen = new Set();
            const recentlyPlayed = [];
            for (const t of recent) {
              const key = `${(t.title || "").toLowerCase()}|${(t.artist || "").toLowerCase()}`;
              if (!t.title || seen.has(key)) continue;
              seen.add(key);
              recentlyPlayed.push({ title: t.title, artist: t.artist });
              if (recentlyPlayed.length >= 10) break;
            }
            personalization = { topArtists, topTracks, recentlyPlayed };
          } catch (err) {
            console.warn("Personalization fetch failed, falling back:", err?.message || err);
          }
        }

        const effectivePrompt = seed
          ? `Build a playlist anchored around "${seed.title}" by ${seed.artist}. It should match that song's sonic and emotional profile. Additional context from the user: ${prompt}`
          : prompt;

        let items;
        try {
          items = await getRecommendations(
            effectivePrompt,
            personalization,
            excludedSongs,
            context,
            settings,
            excludedArtists
          );
        } catch (err) {
          if (err instanceof GeminiParseError) {
            return fail(502, "The AI returned an unreadable response. Try again.");
          }
          if (err instanceof GeminiUnavailableError) {
            return fail(503, "AI is busy right now. Please try again in a moment.");
          }
          throw err;
        }

        const playlistName = titleCasePlaylistName(prompt);
        send({ type: "meta", playlistName, prompt, total: items.length });

        const excludedArtistLowers = new Set(excludedArtists.map((a) => a.toLowerCase()));

        const fetchPreview = async (t) => {
          if (!settings.enableDeezerPreviews) return null;
          try {
            return await getDeezerPreview(t.title, t.artist);
          } catch {
            return null;
          }
        };

        const enriched = [];
        const seenUris = new Set();

        const resolveAndEmit = async (item) => {
          try {
            const track = await withSpotifyRetry(tokenSession, (tok) =>
              searchTrack(tok, item.title, item.artist)
            );
            if (!track) return;
            if (!settings.allowExplicit && track.explicit) return;
            if (isExcludedArtist(track, excludedArtistLowers)) return;
            if (track.uri && seenUris.has(track.uri)) return;
            if (track.uri) seenUris.add(track.uri);
            const previewUrl = await fetchPreview(track);
            const finalTrack = { ...track, previewUrl };
            enriched.push(finalTrack);
            send({ type: "track", track: finalTrack });
          } catch (err) {
            if (err instanceof SpotifyAuthError) throw err;
          }
        };

        if (seed) {
          await resolveAndEmit({ title: seed.title, artist: seed.artist });
          const seedKey = `${seed.title.toLowerCase()}|${seed.artist.toLowerCase()}`;
          const others = items.filter(
            (i) => `${i.title.toLowerCase()}|${i.artist.toLowerCase()}` !== seedKey
          );
          await Promise.all(others.map(resolveAndEmit));
        } else {
          await Promise.all(items.map(resolveAndEmit));
        }

        let promptId = null;
        if (user) {
          try {
            const doc = await Prompt.create({
              userId: user._id,
              promptText: prompt,
              playlistName,
              context: context ?? undefined,
              excludedArtists,
              recommendations: enriched,
            });
            promptId = doc._id.toString();
          } catch (err) {
            console.error("Prompt save failed", err);
          }
        }

        send({ type: "done", promptId });
        controller.close();
      } catch (err) {
        if (err instanceof SpotifyAuthError) {
          return fail(401, "Spotify session expired — please log in again.");
        }
        console.error("/api/recommend stream failed", err);
        return fail(500, "Recommendation failed");
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
