import { jsonError, jsonOk, requireApiSession, spotifySessionExpiredResponse } from "@/lib/api";
import { skipPrevious, SpotifyAuthError } from "@/lib/spotify";

export async function POST() {
  const { session, response } = await requireApiSession();
  if (response) return response;

  try {
    const result = await skipPrevious(session.accessToken);
    if (!result.ok) {
      return jsonError(result.reason, 409);
    }
    return jsonOk({ ok: true });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return spotifySessionExpiredResponse();
    }
    console.error("/api/playback/previous failed", err);
    return jsonError("Failed to skip", 500);
  }
}

export const dynamic = "force-dynamic";
