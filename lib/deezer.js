export async function getDeezerChart(limit = 6) {
  const res = await fetch(`https://api.deezer.com/chart/0?limit=${limit}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Deezer chart failed: ${res.status}`);
  const data = await res.json();

  const playlists = (data.playlists?.data || []).slice(0, limit).map((p) => ({
    kind: "playlist",
    name: p.title,
    prompt: `${p.title} — popular today`,
    count: `${p.nb_tracks ?? "?"} tracks`,
    img: p.picture_medium || p.picture || null,
    externalUrl: p.link || null,
  }));

  const tracks = (data.tracks?.data || []).slice(0, limit).map((t) => ({
    kind: "track",
    name: t.title,
    artist: t.artist?.name || "",
    prompt: `songs like ${t.title} by ${t.artist?.name || ""}`.trim(),
    count: t.artist?.name || "",
    img: t.album?.cover_medium || t.album?.cover || null,
    externalUrl: t.link || null,
  }));

  return { playlists, tracks };
}

export async function getDeezerPreview(title, artist) {
  if (!title || !artist) return null;
  const q = `track:"${title}" artist:"${artist}"`;
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=1`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const item = data?.data?.[0];
    return item?.preview || null;
  } catch {
    return null;
  }
}
