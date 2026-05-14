import { jsonError, jsonOk, requireApiSession, spotifySessionExpiredResponse } from "@/lib/api";
import { getTopArtists, SpotifyAuthError } from "@/lib/spotify";

const ALLOWED_RANGES = new Set(["short_term", "medium_term", "long_term"]);

export async function GET(req) {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const timeRange = searchParams.get("time_range") || "medium_term";
  if (!ALLOWED_RANGES.has(timeRange)) {
    return jsonError("Invalid time_range", 400);
  }

  try {
    const artists = await getTopArtists(session.accessToken, timeRange, 50);
    return jsonOk({ artists });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return spotifySessionExpiredResponse();
    }
    console.error("/api/stats/top-artists failed", err);
    return jsonError("Failed to fetch top artists", 500);
  }
}
