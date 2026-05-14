import { jsonError, jsonOk, requireApiSession, spotifySessionExpiredResponse } from "@/lib/api";
import { skipNext, SpotifyAuthError } from "@/lib/spotify";

export async function POST() {
  const { session, response } = await requireApiSession();
  if (response) return response;

  try {
    const result = await skipNext(session.accessToken);
    if (!result.ok) {
      return jsonError(result.reason, 409);
    }
    return jsonOk({ ok: true });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return spotifySessionExpiredResponse();
    }
    console.error("/api/playback/next failed", err);
    return jsonError("Failed to skip", 500);
  }
}

export const dynamic = "force-dynamic";
