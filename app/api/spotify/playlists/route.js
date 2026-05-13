import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserPlaylists, getLikedSongs, SpotifyAuthError } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.error === "RefreshAccessTokenError") {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const [playlists, liked] = await Promise.all([
      getUserPlaylists(session.accessToken),
      getLikedSongs(session.accessToken, 5),
    ]);
    return NextResponse.json({
      liked: {
        trackCount: liked.trackCount,
        thumbnails: liked.thumbnails,
        spotifyUrl: "https://open.spotify.com/collection/tracks",
      },
      playlists,
    });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return NextResponse.json(
        { error: "Spotify session expired — please log in again." },
        { status: 401 }
      );
    }
    console.error("/api/spotify/playlists failed", err);
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 });
  }
}
