import {
  jsonError,
  jsonOk,
  readJsonBody,
  requireApiSession,
  spotifySessionExpiredResponse,
} from "@/lib/api";
import { togglePlayback, SpotifyAuthError } from "@/lib/spotify";

export async function PUT(req) {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const { body, response: invalidJson } = await readJsonBody(req);
  if (invalidJson) return invalidJson;

  const play = !!body?.play;

  try {
    const result = await togglePlayback(session.accessToken, play, body?.deviceId);
    if (!result.ok) {
      return jsonError(result.reason, 409);
    }
    return jsonOk({ ok: true });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return spotifySessionExpiredResponse();
    }
    console.error("/api/playback/play failed", err);
    return jsonError("Failed to toggle playback", 500);
  }
}

export const dynamic = "force-dynamic";
