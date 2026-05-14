import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSwapRecommendation, GeminiParseError, GeminiUnavailableError } from "@/lib/gemini";
import { searchTrack, SpotifyAuthError } from "@/lib/spotify";
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

  const rl = rateLimit(`swap:${session.spotifyId}`, { limit: 30, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Slow down — try again in ${Math.ceil(rl.retryAfterMs / 1000)}s.` },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const originalPrompt = (body?.originalPrompt || "").toString().trim();
  const currentTracks = body?.currentTracks;
  const trackToReplace = body?.trackToReplace;
  const excludedArtists = Array.isArray(body?.excludedArtists)
    ? body.excludedArtists
        .map((a) => (typeof a === "string" ? a.trim() : ""))
        .filter(Boolean)
        .slice(0, 50)
    : [];

  if (!originalPrompt) {
    return NextResponse.json({ error: "originalPrompt is required" }, { status: 400 });
  }
  if (!Array.isArray(currentTracks) || currentTracks.length === 0) {
    return NextResponse.json(
      { error: "currentTracks must be a non-empty array" },
      { status: 400 }
    );
  }
  if (!trackToReplace?.title || !trackToReplace?.artist) {
    return NextResponse.json(
      { error: "trackToReplace must include title and artist" },
      { status: 400 }
    );
  }

  try {
    const existingKeys = new Set(
      currentTracks.map((t) => `${(t.title || "").toLowerCase()}|${(t.artist || "").toLowerCase()}`)
    );

    let suggestion = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const candidate = await getSwapRecommendation(
        originalPrompt,
        currentTracks,
        trackToReplace,
        excludedArtists
      );
      const key = `${candidate.title.toLowerCase()}|${candidate.artist.toLowerCase()}`;
      if (!existingKeys.has(key)) {
        suggestion = candidate;
        break;
      }
    }
    if (!suggestion) {
      return NextResponse.json(
        { error: "Could not find a suitable replacement" },
        { status: 502 }
      );
    }

    const matched = await searchTrack(session.accessToken, suggestion.title, suggestion.artist);
    if (!matched) {
      return NextResponse.json(
        { error: "No Spotify match for replacement" },
        { status: 502 }
      );
    }
    const previewUrl = matched.previewUrl || (await getDeezerPreview(matched.title, matched.artist));

    return NextResponse.json({ track: { ...matched, previewUrl } });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return NextResponse.json({ error: "Spotify session expired" }, { status: 401 });
    }
    if (err instanceof GeminiParseError) {
      return NextResponse.json({ error: "AI returned unreadable response" }, { status: 502 });
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
    console.error("/api/recommend/swap failed", err);
    return NextResponse.json({ error: "Swap failed" }, { status: 500 });
  }
}
