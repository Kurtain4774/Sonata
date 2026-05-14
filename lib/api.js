import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export function jsonError(error, status, init = {}) {
  return NextResponse.json({ error }, { ...init, status });
}

export function jsonOk(body, init = {}) {
  return NextResponse.json(body, init);
}

export async function requireApiSession({
  requireAccessToken = false,
  rejectRefreshError = true,
  unauthorizedMessage = "Not authenticated",
} = {}) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    (rejectRefreshError && session.error === "RefreshAccessTokenError") ||
    (requireAccessToken && !session.accessToken)
  ) {
    return {
      session: null,
      response: jsonError(unauthorizedMessage, 401),
    };
  }

  return { session, response: null };
}

export async function readJsonBody(req) {
  try {
    return { body: await req.json(), response: null };
  } catch {
    return { body: null, response: jsonError("Invalid JSON", 400) };
  }
}

export function rateLimitResponse(result) {
  const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000);

  return jsonError(`Slow down — try again in ${retryAfterSeconds}s.`, 429, {
    headers: { "Retry-After": String(retryAfterSeconds) },
  });
}

export function spotifySessionExpiredResponse(
  message = "Spotify session expired — please log in again."
) {
  return jsonError(message, 401);
}
