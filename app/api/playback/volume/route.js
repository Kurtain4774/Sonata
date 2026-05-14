import {
  jsonError,
  jsonOk,
  readJsonBody,
  requireApiSession,
  spotifySessionExpiredResponse,
} from "@/lib/api";
import { setPlaybackVolume, SpotifyAuthError } from "@/lib/spotify";

export async function PUT(req) {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const { body, response: invalidJson } = await readJsonBody(req);
  if (invalidJson) return invalidJson;

  const percent = Number(body?.percent);
  if (!Number.isFinite(percent)) {
    return jsonError("percent required", 400);
  }

  try {
    const result = await setPlaybackVolume(session.accessToken, percent, body?.deviceId);
    if (!result.ok) {
      return jsonError(result.reason, 409);
    }
    return jsonOk({ ok: true });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return spotifySessionExpiredResponse();
    }
    console.error("/api/playback/volume failed", err);
    return jsonError("Failed to set volume", 500);
  }
}

export const dynamic = "force-dynamic";
