export class SpotifyAuthError extends Error {}

export async function searchTrack(accessToken, title, artist) {
  const q = `track:"${title}" artist:"${artist}"`;
  const url = `https://api.spotify.com/v1/search?type=track&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (!res.ok) return null;

  const data = await res.json();
  const item = data.tracks?.items?.[0];
  if (!item) return null;

  return {
    spotifyTrackId: item.id,
    uri: item.uri,
    title: item.name,
    artist: item.artists.map((a) => a.name).join(", "),
    albumArt: item.album?.images?.[0]?.url || null,
    previewUrl: item.preview_url,
    spotifyUrl: item.external_urls?.spotify,
  };
}

export async function createPlaylist(accessToken, userId, name, description) {
  const res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description: description || "Built with Sonata",
      public: false,
    }),
  });
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (!res.ok) throw new Error(`Failed to create playlist: ${res.status}`);
  return res.json();
}

export async function addTracksToPlaylist(accessToken, playlistId, uris) {
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris }),
    }
  );
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (!res.ok) throw new Error(`Failed to add tracks: ${res.status}`);
  return res.json();
}

async function spotifyGet(accessToken, url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (!res.ok) throw new Error(`Spotify request failed: ${res.status}`);
  return res.json();
}

export async function getTopArtists(accessToken, timeRange = "medium_term", limit = 50) {
  const url = `https://api.spotify.com/v1/me/top/artists?time_range=${encodeURIComponent(
    timeRange
  )}&limit=${limit}`;
  const data = await spotifyGet(accessToken, url);
  return (data.items || []).map((a) => ({
    id: a.id,
    name: a.name,
    images: a.images || [],
    genres: a.genres || [],
    spotifyUrl: a.external_urls?.spotify || null,
  }));
}

export async function getTopTracks(accessToken, timeRange = "medium_term", limit = 50) {
  const url = `https://api.spotify.com/v1/me/top/tracks?time_range=${encodeURIComponent(
    timeRange
  )}&limit=${limit}`;
  const data = await spotifyGet(accessToken, url);
  return (data.items || []).map((t) => ({
    id: t.id,
    title: t.name,
    artist: (t.artists || []).map((a) => a.name).join(", "),
    albumArt: t.album?.images?.[0]?.url || null,
    durationMs: t.duration_ms,
    spotifyUrl: t.external_urls?.spotify || null,
  }));
}

export async function getRecentlyPlayed(accessToken, limit = 50) {
  const url = `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`;
  const data = await spotifyGet(accessToken, url);
  return (data.items || []).map((item) => {
    const t = item.track || {};
    return {
      id: t.id,
      playedAt: item.played_at,
      title: t.name,
      artist: (t.artists || []).map((a) => a.name).join(", "),
      albumArt: t.album?.images?.[0]?.url || null,
      spotifyUrl: t.external_urls?.spotify || null,
    };
  });
}

export async function getActiveDevice(accessToken) {
  const res = await fetch("https://api.spotify.com/v1/me/player", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (res.status === 204 || !res.ok) return null;
  const data = await res.json();
  return data.device ?? null;
}

export async function addToQueue(accessToken, trackUri) {
  const res = await fetch(
    `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(trackUri)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (res.status === 403) {
    const data = await res.json().catch(() => ({}));
    const reason = data?.error?.reason;
    throw new Error(reason === "PREMIUM_REQUIRED" ? "PREMIUM_REQUIRED" : "FORBIDDEN");
  }
  if (!res.ok) throw new Error(`Queue failed: ${res.status}`);
}

export async function searchTracks(accessToken, items) {
  const results = await Promise.all(
    items.map((i) =>
      searchTrack(accessToken, i.title, i.artist).catch((err) => {
        if (err instanceof SpotifyAuthError) throw err;
        return null;
      })
    )
  );
  return results.filter(Boolean);
}
