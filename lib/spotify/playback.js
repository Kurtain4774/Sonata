import { SpotifyAuthError } from "./errors";

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
          artist: (item.artists || []).map((artist) => artist.name).join(", "),
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
