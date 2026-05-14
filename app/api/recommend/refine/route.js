import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRefinedRecommendations } from "@/lib/gemini";
import { searchTracks } from "@/lib/spotify";
import { getDeezerPreview } from "@/lib/deezer";
import { rateLimit } from "@/lib/rateLimit";
import { parseExcludedArtists, isExcludedArtist, mapRecommendError } from "@/lib/recommendHelpers";

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
  const excludedArtists = parseExcludedArtists(body);

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
      matched = matched.filter((t) => !isExcludedArtist(t, lowers));
    }
    const tracks = await Promise.all(
      matched.map(async (t) => ({
        ...t,
        previewUrl: await getDeezerPreview(t.title, t.artist),
      }))
    );

    return NextResponse.json({ tracks });
  } catch (err) {
    const mapped = mapRecommendError(err);
    if (mapped) return mapped;
    console.error("/api/recommend/refine failed", err);
    return NextResponse.json({ error: "Refinement failed" }, { status: 500 });
  }
}
