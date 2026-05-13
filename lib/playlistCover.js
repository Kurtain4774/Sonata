import { createCanvas, loadImage } from "canvas";

const SIZE = 640;
const QUAD = SIZE / 2;

export async function generatePlaylistCover(albumArtUrls) {
  const urls = albumArtUrls.filter(Boolean).slice(0, 4);
  if (urls.length === 0) return null;

  // Pad to 4 by repeating
  while (urls.length < 4) urls.push(urls[urls.length - 1]);

  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d");

  const positions = [
    [0, 0],
    [QUAD, 0],
    [0, QUAD],
    [QUAD, QUAD],
  ];

  await Promise.all(
    urls.map(async (url, i) => {
      const img = await loadImage(url);
      const [x, y] = positions[i];
      ctx.drawImage(img, x, y, QUAD, QUAD);
    })
  );

  const buffer = canvas.toBuffer("image/jpeg", { quality: 0.85 });
  if (buffer.length > 256 * 1024) return null;

  return buffer.toString("base64");
}

export async function uploadPlaylistCover(accessToken, playlistId, albumArtUrls) {
  try {
    const base64 = await generatePlaylistCover(albumArtUrls);
    if (!base64) return;

    const res = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/images`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "image/jpeg",
        },
        body: base64,
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`Playlist cover upload failed (${res.status}): ${text}`);
    }
  } catch (err) {
    console.warn("Playlist cover generation skipped:", err?.message ?? err);
  }
}
