import { buildTrackSearchQuery, mapSpotifyTrack } from "../spotifyTrackMapper";
import { SpotifyAuthError } from "./errors";

export async function searchTrack(accessToken, title, artist) {
  const q = buildTrackSearchQuery(title, artist);
  const url = `https://api.spotify.com/v1/search?type=track&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (!res.ok) return null;

  const data = await res.json();
  const item = data.tracks?.items?.[0];
  if (!item) return null;

  return mapSpotifyTrack(item, title, artist);
}

export async function searchTracks(accessToken, items) {
  const results = await Promise.all(
    items.map((item) =>
      searchTrack(accessToken, item.title, item.artist).catch((err) => {
        if (err instanceof SpotifyAuthError) throw err;
        return null;
      })
    )
  );
  return results.filter(Boolean);
}
