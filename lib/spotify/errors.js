export class SpotifyAuthError extends Error {}

export class SpotifyApiError extends Error {
  constructor(message, { status, spotifyMessage, body } = {}) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
    this.spotifyMessage = spotifyMessage;
    this.body = body;
  }
}

export async function getSpotifyError(res) {
  const body = await res.json().catch(() => null);
  const spotifyMessage =
    body?.error?.message ||
    body?.error_description ||
    body?.error ||
    (body ? JSON.stringify(body) : res.statusText);
  return { body, spotifyMessage };
}

export async function throwSpotifyApiError(res, message) {
  const { body, spotifyMessage } = await getSpotifyError(res);
  throw new SpotifyApiError(`${message}: ${res.status} - ${spotifyMessage}`, {
    status: res.status,
    spotifyMessage,
    body,
  });
}

export async function spotifyGet(accessToken, url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (!res.ok) await throwSpotifyApiError(res, "Spotify request failed");
  return res.json();
}

// Authenticated write request (POST/PUT/DELETE) with shared auth/error handling.
// Returns the raw Response so callers can parse JSON or ignore the body.
export async function spotifyMutate(accessToken, url, { method, body, errorMessage }) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (!res.ok) await throwSpotifyApiError(res, errorMessage);
  return res;
}
