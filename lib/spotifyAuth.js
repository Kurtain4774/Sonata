import { connectDB } from "./mongodb";
import { decrypt, encrypt } from "./crypto";
import User from "@/models/User";
import { SpotifyAuthError } from "./spotify";

// Shared token-refresh request. Throws on non-OK so callers can distinguish
// transport/credential failure from the no-refresh-token case.
export async function requestSpotifyTokenRefresh(refreshToken) {
  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body?.error_description || "Spotify refresh failed");
    err.body = body;
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function rotateToken(spotifyId) {
  if (!spotifyId) return null;
  await connectDB();
  const user = await User.findOne({ spotifyId });
  if (!user?.refreshToken) return null;
  let refresh;
  try {
    refresh = decrypt(user.refreshToken);
  } catch {
    return null;
  }
  if (!refresh) return null;

  let data;
  try {
    data = await requestSpotifyTokenRefresh(refresh);
  } catch {
    return null;
  }
  if (!data.access_token) return null;

  await User.updateOne(
    { spotifyId },
    {
      accessToken: encrypt(data.access_token),
      refreshToken: encrypt(data.refresh_token || refresh),
      tokenExpiry: new Date(Date.now() + (data.expires_in || 3600) * 1000),
    }
  );
  return data.access_token;
}

// Run fn(accessToken). If it throws a SpotifyAuthError, rotate the token via
// the stored refresh token and retry once with the new access token. If the
// rotation or retry fails, rethrow the original SpotifyAuthError so callers
// can surface a re-auth prompt to the client.
//
// Side-effect: mutates session.accessToken so subsequent calls in the same
// request reuse the rotated token. NextAuth's JWT itself is not updated here;
// it self-rotates the next time `jwt()` runs.
export async function withSpotifyRetry(session, fn) {
  try {
    return await fn(session.accessToken);
  } catch (err) {
    if (!(err instanceof SpotifyAuthError)) throw err;
    const next = await rotateToken(session.spotifyId);
    if (!next) throw err;
    session.accessToken = next;
    return await fn(next);
  }
}
