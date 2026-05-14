import {
  getSpotifyError,
  spotifyGet,
  SpotifyAuthError,
  SpotifyApiError,
  throwSpotifyApiError,
} from "./errors";

export async function removeTracksFromPlaylist(accessToken, playlistId, uris) {
  if (!uris?.length) return { ok: true };
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tracks: uris.map((uri) => ({ uri })) }),
  });
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (!res.ok) await throwSpotifyApiError(res, "Failed to remove tracks");
  return res.json();
}

export async function replacePlaylistTracks(accessToken, playlistId, uris) {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris }),
  });
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (!res.ok) await throwSpotifyApiError(res, "Failed to replace tracks");
  return res.json();
}

export async function updatePlaylistDetails(accessToken, playlistId, { name, description }) {
  const body = {};
  if (name !== undefined) body.name = name;
  if (description !== undefined) body.description = description;
  if (!Object.keys(body).length) return { ok: true };

  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (!res.ok) await throwSpotifyApiError(res, "Failed to update playlist");
  return { ok: true };
}

export async function createPlaylist(accessToken, name, description) {
  const res = await fetch("https://api.spotify.com/v1/me/playlists", {
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
  if (!res.ok) await throwSpotifyApiError(res, "Failed to create playlist");
  return res.json();
}

export async function addTracksToPlaylist(accessToken, playlistId, uris) {
  if (!uris?.length) return { ok: true };
  let lastResult = null;
  for (let i = 0; i < uris.length; i += 100) {
    const chunk = uris.slice(i, i + 100);
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: chunk }),
    });
    if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
    if (!res.ok) {
      const { body, spotifyMessage } = await getSpotifyError(res);
      throw new SpotifyApiError(
        `Failed to add tracks: ${res.status} - ${spotifyMessage} | uris sample: ${JSON.stringify(chunk.slice(0, 3))}`,
        { status: res.status, spotifyMessage, body }
      );
    }
    lastResult = await res.json();
  }
  return lastResult;
}

export async function reorderPlaylistTracks(
  accessToken,
  playlistId,
  rangeStart,
  insertBefore,
  rangeLength = 1
) {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      range_start: rangeStart,
      insert_before: insertBefore,
      range_length: rangeLength,
    }),
  });
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (!res.ok) await throwSpotifyApiError(res, "Failed to reorder tracks");
  return res.json();
}

export async function getUserPlaylists(accessToken, limit = 50) {
  const url = `https://api.spotify.com/v1/me/playlists?limit=${limit}`;
  const data = await spotifyGet(accessToken, url);
  return (data.items || []).map((playlist) => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description || "",
    trackCount: playlist.tracks?.total ?? 0,
    thumbnails: [playlist.images?.[0]?.url].filter(Boolean),
    spotifyUrl: playlist.external_urls?.spotify || null,
  }));
}

export async function getLikedSongs(accessToken, thumbLimit = 5) {
  const url = `https://api.spotify.com/v1/me/tracks?limit=${thumbLimit}`;
  const data = await spotifyGet(accessToken, url);
  return {
    trackCount: data.total ?? 0,
    thumbnails: (data.items || [])
      .map((item) => item.track?.album?.images?.[0]?.url)
      .filter(Boolean),
  };
}
