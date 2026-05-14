import { spotifyGet, SpotifyAuthError } from "./errors";

export async function getTopArtists(accessToken, timeRange = "medium_term", limit = 50) {
  const url = `https://api.spotify.com/v1/me/top/artists?time_range=${encodeURIComponent(
    timeRange
  )}&limit=${limit}`;
  const data = await spotifyGet(accessToken, url);
  return (data.items || []).map((artist) => ({
    id: artist.id,
    name: artist.name,
    images: artist.images || [],
    genres: artist.genres || [],
    spotifyUrl: artist.external_urls?.spotify || null,
  }));
}

export async function getTopTracks(accessToken, timeRange = "medium_term", limit = 50) {
  const url = `https://api.spotify.com/v1/me/top/tracks?time_range=${encodeURIComponent(
    timeRange
  )}&limit=${limit}`;
  const data = await spotifyGet(accessToken, url);
  return (data.items || []).map((track) => ({
    id: track.id,
    title: track.name,
    artist: (track.artists || []).map((artist) => artist.name).join(", "),
    albumArt: track.album?.images?.[0]?.url || null,
    durationMs: track.duration_ms,
    spotifyUrl: track.external_urls?.spotify || null,
  }));
}

export async function getRecentlyPlayed(accessToken, limit = 50) {
  const url = `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`;
  const data = await spotifyGet(accessToken, url);
  return (data.items || []).map((item) => {
    const track = item.track || {};
    return {
      id: track.id,
      playedAt: item.played_at,
      title: track.name,
      artist: (track.artists || []).map((artist) => artist.name).join(", "),
      artistIds: (track.artists || []).map((artist) => artist.id).filter(Boolean),
      albumArt: track.album?.images?.[0]?.url || null,
      spotifyUrl: track.external_urls?.spotify || null,
      durationMs: track.duration_ms || 0,
    };
  });
}

export async function getArtistById(accessToken, id) {
  const res = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (!res.ok) return null;
  const artist = await res.json();
  return { id: artist.id, name: artist.name, genres: artist.genres || [] };
}

export async function getArtistsByIds(accessToken, ids) {
  if (!ids?.length) return [];
  const unique = [...new Set(ids)].slice(0, 50);
  const results = await Promise.all(
    unique.map((id) =>
      getArtistById(accessToken, id).catch((err) => {
        if (err instanceof SpotifyAuthError) throw err;
        return null;
      })
    )
  );
  return results.filter(Boolean);
}
