// Client-credentials flow for public Spotify endpoints (no user login needed).
// Used by the landing page to resolve real album art for sample tracks.

import { buildTrackSearchQuery, mapSpotifyTrack } from "./spotifyTrackMapper";

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAppToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 60_000) return cachedToken;

  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Spotify token request failed: ${res.status}`);
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in ?? 3600) * 1000;
  return cachedToken;
}

export async function searchTrackPublic(title, artist) {
  const token = await getAppToken();
  const q = buildTrackSearchQuery(title, artist);
  const url = `https://api.spotify.com/v1/search?type=track&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const item = data.tracks?.items?.[0];
  if (!item) return null;
  return mapSpotifyTrack(item, title, artist, { includeMatch: false });
}
