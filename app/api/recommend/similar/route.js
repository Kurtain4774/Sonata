import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSimilarRecommendations, GeminiParseError } from "@/lib/gemini";
import { searchTracks, SpotifyAuthError } from "@/lib/spotify";
import { getDeezerPreview } from "@/lib/deezer";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";

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

  const { promptId, currentTracks } = body || {};

  try {
    let tracks = currentTracks;
    if (!Array.isArray(tracks) || tracks.length === 0) {
      if (!promptId) {
        return NextResponse.json(
          { error: "promptId or currentTracks required" },
          { status: 400 }
        );
      }
      await connectDB();
      const user = await User.findOne({ spotifyId: session.spotifyId });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      const doc = await Prompt.findOne({ _id: promptId, userId: user._id }).lean();
      if (!doc) return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
      tracks = doc.recommendations || [];
    }

    if (!tracks.length) {
      return NextResponse.json({ tracks: [] });
    }

    const items = await getSimilarRecommendations(tracks, 20);
    const matched = await searchTracks(session.accessToken, items);
    const existingUris = new Set(tracks.map((t) => t.uri));
    const filtered = matched.filter((t) => !existingUris.has(t.uri));
    const enriched = await Promise.all(
      filtered.map(async (t) => ({
        ...t,
        previewUrl: t.previewUrl || (await getDeezerPreview(t.title, t.artist)),
      }))
    );

    return NextResponse.json({ tracks: enriched });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return NextResponse.json({ error: "Spotify session expired" }, { status: 401 });
    }
    if (err instanceof GeminiParseError) {
      return NextResponse.json({ error: "AI returned unreadable response" }, { status: 502 });
    }
    console.error("/api/recommend/similar failed", err);
    return NextResponse.json({ error: "Similar fetch failed" }, { status: 500 });
  }
}
