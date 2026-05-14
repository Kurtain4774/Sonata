import { getActiveDevice, addToQueue, SpotifyAuthError } from "@/lib/spotify";
import { jsonError, jsonOk, requireApiSession } from "@/lib/api";

export async function POST(req) {
  const { session, response } = await requireApiSession({
    requireAccessToken: true,
    rejectRefreshError: false,
    unauthorizedMessage: "Unauthorized",
  });
  if (response) return response;

  const { trackUris } = await req.json();
  if (!Array.isArray(trackUris) || trackUris.length === 0) {
    return jsonError("trackUris required", 400);
  }

  try {
    const device = await getActiveDevice(session.accessToken);
    if (!device) {
      return jsonError("NO_ACTIVE_DEVICE", 409);
    }

    for (const uri of trackUris) {
      await addToQueue(session.accessToken, uri);
    }

    return jsonOk({ queued: trackUris.length });
  } catch (err) {
    if (err instanceof SpotifyAuthError) {
      return jsonError("Unauthorized", 401);
    }
    if (err.message === "PREMIUM_REQUIRED" || err.message === "FORBIDDEN") {
      return jsonError("PREMIUM_REQUIRED", 403);
    }
    console.error("Queue error", err);
    return jsonError(err.message, 500);
  }
}
