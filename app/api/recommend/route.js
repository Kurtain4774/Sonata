import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecommendations, GeminiParseError } from "@/lib/gemini";
import { searchTracks, SpotifyAuthError, getTopArtists, getTopTracks } from "@/lib/spotify";
import { getDeezerPreview } from "@/lib/deezer";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import Settings from "@/models/Settings";
import { mergeWithDefaults } from "@/lib/settings";

function titleCasePlaylistName(prompt) {
  const trimmed = prompt.trim().slice(0, 60);
  return trimmed
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ") + " Mix";
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.error === "RefreshAccessTokenError") {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = (body?.prompt || "").toString().trim();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  if (prompt.length > 500) {
    return NextResponse.json({ error: "Prompt too long (max 500 chars)" }, { status: 400 });
  }
  const context = body?.context ?? null;

  try {
    await connectDB();
    const user = await User.findOne({ spotifyId: session.spotifyId });

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
        const [topArtists, topTracks] = await Promise.all([
          getTopArtists(session.accessToken, "medium_term", 10),
          getTopTracks(session.accessToken, "medium_term", 10),
        ]);
        personalization = { topArtists, topTracks };
      } catch (err) {
        console.warn("Personalization fetch failed, falling back:", err?.message || err);
      }
    }

    const items = await getRecommendations(prompt, personalization, excludedSongs, context, settings);
    let matched = await searchTracks(session.accessToken, items);
    if (!settings.allowExplicit) {
      matched = matched.filter((t) => !t.explicit);
    }
    const fetchPreview = settings.enableDeezerPreviews
      ? (t) => getDeezerPreview(t.title, t.artist)
      : async () => null;
    const tracks = await Promise.all(
      matched.map(async (t) => ({
        ...t,
        previewUrl: await fetchPreview(t),
      }))
    );
    const playlistName = titleCasePlaylistName(prompt);
    let promptId = null;
    if (user) {
      const doc = await Prompt.create({
        userId: user._id,
        promptText: prompt,
        playlistName,
        context: context ?? undefined,
        recommendations: tracks,
      });
      promptId = doc._id.toString();
    }

    return NextResponse.json({
      promptId,
      playlistName,
      prompt,
      tracks,
    });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return NextResponse.json(
        { error: "Spotify session expired — please log in again." },
        { status: 401 }
      );
    }
    if (err instanceof GeminiParseError) {
      return NextResponse.json(
        { error: "The AI returned an unreadable response. Try again." },
        { status: 502 }
      );
    }
    console.error("/api/recommend failed", err);
    return NextResponse.json({ error: "Recommendation failed" }, { status: 500 });
  }
}
