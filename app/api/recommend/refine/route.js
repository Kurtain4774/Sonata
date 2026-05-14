import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRefinedRecommendations, GeminiParseError, GeminiUnavailableError } from "@/lib/gemini";
import { searchTracks, SpotifyAuthError } from "@/lib/spotify";
import { getDeezerPreview } from "@/lib/deezer";
import { rateLimit } from "@/lib/rateLimit";

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

  const rl = rateLimit(`refine:${session.spotifyId}`, { limit: 15, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Slow down — try again in ${Math.ceil(rl.retryAfterMs / 1000)}s.` },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const originalPrompt = (body?.originalPrompt || "").toString().trim();
  const followUp = (body?.followUp || "").toString().trim();
  const currentTracks = body?.currentTracks;
  const excludedArtists = Array.isArray(body?.excludedArtists)
    ? body.excludedArtists
        .map((a) => (typeof a === "string" ? a.trim() : ""))
        .filter(Boolean)
        .slice(0, 50)
    : [];

  if (!originalPrompt || !followUp) {
    return NextResponse.json(
      { error: "originalPrompt and followUp are required" },
      { status: 400 }
    );
  }
  if (!Array.isArray(currentTracks) || currentTracks.length === 0) {
    return NextResponse.json(
      { error: "currentTracks must be a non-empty array" },
      { status: 400 }
    );
  }
  if (followUp.length > 500) {
    return NextResponse.json(
      { error: "Follow-up too long (max 500 chars)" },
      { status: 400 }
    );
  }

  try {
    const items = await getRefinedRecommendations(originalPrompt, currentTracks, followUp, excludedArtists);
    let matched = await searchTracks(session.accessToken, items);
    if (excludedArtists.length > 0) {
      const lowers = new Set(excludedArtists.map((a) => a.toLowerCase()));
      matched = matched.filter((t) => {
        const artists = (t.artist || "").split(",").map((s) => s.trim().toLowerCase());
        return !artists.some((a) => lowers.has(a));
      });
    }
    const tracks = await Promise.all(
      matched.map(async (t) => ({
        ...t,
        previewUrl: await getDeezerPreview(t.title, t.artist),
      }))
    );

    return NextResponse.json({ tracks });
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
    if (err instanceof GeminiUnavailableError) {
      return NextResponse.json(
        { error: "AI is busy right now. Please try again in a moment." },
        {
          status: 503,
          headers: { "Retry-After": String(Math.ceil((err.retryAfterMs || 2000) / 1000)) },
        }
      );
    }
    console.error("/api/recommend/refine failed", err);
    return NextResponse.json({ error: "Refinement failed" }, { status: 500 });
  }
}
