import { trackMatchScore } from "./stringSimilarity";
import { moodFitFromScore } from "./moodFit";

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

  const spotifyArtist = item.artists.map((a) => a.name).join(", ");
  const matchScore = trackMatchScore(title, artist, item.name, item.artists?.[0]?.name || "");
  const moodFit = moodFitFromScore(matchScore);

  return {
    spotifyTrackId: item.id,
    uri: item.uri,
    title: item.name,
    artist: spotifyArtist,
    album: item.album?.name || null,
    albumArt: item.album?.images?.[0]?.url || null,
    previewUrl: item.preview_url,
    spotifyUrl: item.external_urls?.spotify,
    explicit: Boolean(item.explicit),
    durationMs: item.duration_ms ?? null,
    matchScore,
    moodFit,
  };
}

export async function removeTracksFromPlaylist(accessToken, playlistId, uris) {
  if (!uris?.length) return { ok: true };
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tracks: uris.map((uri) => ({ uri })) }),
    }
  );
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (!res.ok) throw new Error(`Failed to remove tracks: ${res.status}`);
  return res.json();
}

export async function replacePlaylistTracks(accessToken, playlistId, uris) {
  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris }),
    }
  );
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (!res.ok) throw new Error(`Failed to replace tracks: ${res.status}`);
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
  if (!res.ok) throw new Error(`Failed to update playlist: ${res.status}`);
  return { ok: true };
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

export async function getCurrentPlayback(accessToken) {
  const res = await fetch("https://api.spotify.com/v1/me/player", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (res.status === 204 || !res.ok) return null;
  const data = await res.json();
  const item = data.item || null;
  return {
    isPlaying: !!data.is_playing,
    progressMs: data.progress_ms ?? 0,
    durationMs: item?.duration_ms ?? 0,
    track: item
      ? {
          id: item.id,
          title: item.name,
          artist: (item.artists || []).map((a) => a.name).join(", "),
          albumArt: item.album?.images?.[0]?.url || null,
          spotifyUrl: item.external_urls?.spotify || null,
        }
      : null,
    device: data.device
      ? {
          id: data.device.id,
          name: data.device.name,
          type: data.device.type,
          volumePercent: data.device.volume_percent ?? null,
        }
      : null,
  };
}

export async function setPlaybackVolume(accessToken, percent, deviceId) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const params = new URLSearchParams({ volume_percent: String(clamped) });
  if (deviceId) params.set("device_id", deviceId);
  const res = await fetch(
    `https://api.spotify.com/v1/me/player/volume?${params.toString()}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (res.status === 404) return { ok: false, reason: "NO_ACTIVE_DEVICE" };
  if (res.status === 403) {
    const data = await res.json().catch(() => ({}));
    const reason = data?.error?.reason;
    return { ok: false, reason: reason === "PREMIUM_REQUIRED" ? "PREMIUM_REQUIRED" : "FORBIDDEN" };
  }
  if (!res.ok) return { ok: false, reason: `HTTP_${res.status}` };
  return { ok: true };
}

async function playbackControl(url, method, accessToken) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) throw new SpotifyAuthError("Spotify token rejected");
  if (res.status === 404) return { ok: false, reason: "NO_ACTIVE_DEVICE" };
  if (res.status === 403) {
    const data = await res.json().catch(() => ({}));
    const reason = data?.error?.reason;
    return { ok: false, reason: reason === "PREMIUM_REQUIRED" ? "PREMIUM_REQUIRED" : "FORBIDDEN" };
  }
  if (!res.ok && res.status !== 204) return { ok: false, reason: `HTTP_${res.status}` };
  return { ok: true };
}

export async function togglePlayback(accessToken, play, deviceId) {
  const endpoint = play ? "play" : "pause";
  const params = new URLSearchParams();
  if (deviceId) params.set("device_id", deviceId);
  const qs = params.toString();
  const url = `https://api.spotify.com/v1/me/player/${endpoint}${qs ? `?${qs}` : ""}`;
  return playbackControl(url, "PUT", accessToken);
}

export async function skipNext(accessToken) {
  return playbackControl("https://api.spotify.com/v1/me/player/next", "POST", accessToken);
}

export async function skipPrevious(accessToken) {
  return playbackControl("https://api.spotify.com/v1/me/player/previous", "POST", accessToken);
}

export async function seekPlayback(accessToken, positionMs) {
  const clamped = Math.max(0, Math.round(positionMs));
  const url = `https://api.spotify.com/v1/me/player/seek?position_ms=${clamped}`;
  return playbackControl(url, "PUT", accessToken);
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

export async function getUserPlaylists(accessToken, limit = 50) {
  const url = `https://api.spotify.com/v1/me/playlists?limit=${limit}`;
  const data = await spotifyGet(accessToken, url);
  return (data.items || []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    trackCount: p.tracks?.total ?? 0,
    thumbnails: [p.images?.[0]?.url].filter(Boolean),
    spotifyUrl: p.external_urls?.spotify || null,
  }));
}

export async function getLikedSongs(accessToken, thumbLimit = 5) {
  const url = `https://api.spotify.com/v1/me/tracks?limit=${thumbLimit}`;
  const data = await spotifyGet(accessToken, url);
  return {
    trackCount: data.total ?? 0,
    thumbnails: (data.items || [])
      .map((i) => i.track?.album?.images?.[0]?.url)
      .filter(Boolean),
  };
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
