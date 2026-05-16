import {
  getSpotifyError,
  spotifyGet,
  spotifyMutate,
  SpotifyAuthError,
  SpotifyApiError,
} from "./errors";

// Spotify caps playlist track-mutation requests at 100 URIs each.
const ADD_TRACKS_BATCH_SIZE = 100;

export async function removeTracksFromPlaylist(accessToken, playlistId, uris) {
  if (!uris?.length) return { ok: true };
  const res = await spotifyMutate(
    accessToken,
    `https://api.spotify.com/v1/playlists/${playlistId}/items`,
    {
      method: "DELETE",
      body: { tracks: uris.map((uri) => ({ uri })) },
      errorMessage: "Failed to remove tracks",
    }
  );
  return res.json();
}

export async function replacePlaylistTracks(accessToken, playlistId, uris) {
  const res = await spotifyMutate(
    accessToken,
    `https://api.spotify.com/v1/playlists/${playlistId}/items`,
    { method: "PUT", body: { uris }, errorMessage: "Failed to replace tracks" }
  );
  return res.json();
}

export async function updatePlaylistDetails(accessToken, playlistId, { name, description }) {
  const body = {};
  if (name !== undefined) body.name = name;
  if (description !== undefined) body.description = description;
  if (!Object.keys(body).length) return { ok: true };

  await spotifyMutate(
    accessToken,
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    { method: "PUT", body, errorMessage: "Failed to update playlist" }
  );
  return { ok: true };
}

export async function createPlaylist(accessToken, name, description) {
  const res = await spotifyMutate(
    accessToken,
    "https://api.spotify.com/v1/me/playlists",
    {
      method: "POST",
      body: { name, description: description || "Built with Sonata", public: false },
      errorMessage: "Failed to create playlist",
    }
  );
  return res.json();
}

export async function addTracksToPlaylist(accessToken, playlistId, uris) {
  if (!uris?.length) return { ok: true };
  let lastResult = null;
  for (let i = 0; i < uris.length; i += ADD_TRACKS_BATCH_SIZE) {
    const chunk = uris.slice(i, i + ADD_TRACKS_BATCH_SIZE);
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
  const res = await spotifyMutate(
    accessToken,
    `https://api.spotify.com/v1/playlists/${playlistId}/items`,
    {
      method: "PUT",
      body: {
        range_start: rangeStart,
        insert_before: insertBefore,
        range_length: rangeLength,
      },
      errorMessage: "Failed to reorder tracks",
    }
  );
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
