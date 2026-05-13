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
