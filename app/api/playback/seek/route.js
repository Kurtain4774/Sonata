import {
  jsonError,
  jsonOk,
  readJsonBody,
  requireApiSession,
  spotifySessionExpiredResponse,
} from "@/lib/api";
import { seekPlayback, SpotifyAuthError } from "@/lib/spotify";

export async function PUT(req) {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const { body, response: invalidJson } = await readJsonBody(req);
  if (invalidJson) return invalidJson;

  const positionMs = Number(body?.positionMs);
  if (!Number.isFinite(positionMs)) {
    return jsonError("positionMs required", 400);
  }

  try {
    const result = await seekPlayback(session.accessToken, positionMs);
    if (!result.ok) {
      return jsonError(result.reason, 409);
    }
    return jsonOk({ ok: true });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return spotifySessionExpiredResponse();
    }
    console.error("/api/playback/seek failed", err);
    return jsonError("Failed to seek", 500);
  }
}

export const dynamic = "force-dynamic";
