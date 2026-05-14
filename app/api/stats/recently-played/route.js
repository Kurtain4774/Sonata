import { jsonError, jsonOk, requireApiSession, spotifySessionExpiredResponse } from "@/lib/api";
import { getRecentlyPlayed, SpotifyAuthError } from "@/lib/spotify";

export async function GET() {
  const { session, response } = await requireApiSession();
  if (response) return response;

  try {
    const tracks = await getRecentlyPlayed(session.accessToken, 50);
    return jsonOk({ tracks });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return spotifySessionExpiredResponse();
    }
    console.error("/api/stats/recently-played failed", err);
    return jsonError("Failed to fetch recently played", 500);
  }
}

export const dynamic = "force-dynamic";
