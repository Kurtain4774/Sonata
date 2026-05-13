import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentPlayback, SpotifyAuthError } from "@/lib/spotify";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.error === "RefreshAccessTokenError") {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const playback = await getCurrentPlayback(session.accessToken);
    return NextResponse.json({ playback });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return NextResponse.json(
        { error: "Spotify session expired — please log in again." },
        { status: 401 }
      );
    }
    console.error("/api/now-playing failed", err);
    return NextResponse.json({ error: "Failed to fetch playback" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
