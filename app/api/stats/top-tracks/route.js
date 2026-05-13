import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTopTracks, SpotifyAuthError } from "@/lib/spotify";

const ALLOWED_RANGES = new Set(["short_term", "medium_term", "long_term"]);

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.error === "RefreshAccessTokenError") {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const timeRange = searchParams.get("time_range") || "medium_term";
  if (!ALLOWED_RANGES.has(timeRange)) {
    return NextResponse.json({ error: "Invalid time_range" }, { status: 400 });
  }

  try {
    const tracks = await getTopTracks(session.accessToken, timeRange, 50);
    return NextResponse.json({ tracks });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return NextResponse.json(
        { error: "Spotify session expired — please log in again." },
        { status: 401 }
      );
    }
    console.error("/api/stats/top-tracks failed", err);
    return NextResponse.json({ error: "Failed to fetch top tracks" }, { status: 500 });
  }
}
