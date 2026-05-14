import { jsonError, jsonOk, requireApiSession, spotifySessionExpiredResponse } from "@/lib/api";
import { getUserPlaylists, getLikedSongs, SpotifyAuthError } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireApiSession();
  if (response) return response;

  try {
    const [playlists, liked] = await Promise.all([
      getUserPlaylists(session.accessToken),
      getLikedSongs(session.accessToken, 5),
    ]);
    return jsonOk({
      liked: {
        trackCount: liked.trackCount,
        thumbnails: liked.thumbnails,
        spotifyUrl: "https://open.spotify.com/collection/tracks",
      },
      playlists,
    });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return spotifySessionExpiredResponse();
    }
    console.error("/api/spotify/playlists failed", err);
    return jsonError("Failed to fetch playlists", 500);
  }
}
