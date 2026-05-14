import { jsonError, jsonOk, requireApiSession, spotifySessionExpiredResponse } from "@/lib/api";
import { getCurrentPlayback, SpotifyAuthError } from "@/lib/spotify";

export async function GET() {
  const { session, response } = await requireApiSession();
  if (response) return response;

  try {
    const playback = await getCurrentPlayback(session.accessToken);
    return jsonOk({ playback });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return spotifySessionExpiredResponse();
    }
    console.error("/api/now-playing failed", err);
    return jsonError("Failed to fetch playback", 500);
  }
}

export const dynamic = "force-dynamic";
