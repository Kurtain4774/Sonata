import { connectDB } from "@/lib/mongodb";
import ArtistGenre from "@/models/ArtistGenre";
import { getArtistGenresBatch } from "@/lib/gemini";

/**
 * Classify a list of Spotify artists into broad genres, using a global Mongo
 * cache (one row per artist). Gemini is only called for artists not yet in
 * the cache; results are persisted for future lookups by any user.
 *
 * @param {Array<{ id: string, name: string }>} artists
 * @returns {Promise<Array<{ artistId: string, name: string, genre: string }>>}
 */
export async function classifyArtists(artists = []) {
  const cleaned = artists
    .filter((a) => a?.id && a?.name)
    .map((a) => ({ id: a.id, name: a.name }));
  if (cleaned.length === 0) return [];

  await connectDB();

  const ids = cleaned.map((a) => a.id);
  const existing = await ArtistGenre.find({ spotifyArtistId: { $in: ids } })
    .select("spotifyArtistId genre")
    .lean();
  const cached = new Map(existing.map((e) => [e.spotifyArtistId, e.genre]));

  const missing = cleaned.filter((a) => !cached.has(a.id));

  if (missing.length > 0) {
    let classifications = [];
    try {
      classifications = await getArtistGenresBatch(missing.map((a) => a.name));
    } catch (err) {
      console.warn(`classifyArtists: Gemini failed for ${missing.length} artists:`, err?.message);
    }

    // Match Gemini results back to artist IDs. Prefer exact-name match; fall
    // back to position since the prompt is order-preserving.
    const byName = new Map();
    for (const c of classifications) {
      if (typeof c?.artist === "string" && typeof c?.genre === "string") {
        byName.set(c.artist.toLowerCase(), c.genre);
      }
    }

    const ops = [];
    missing.forEach((artist, i) => {
      let genre = byName.get(artist.name.toLowerCase());
      if (!genre && classifications[i]?.genre) genre = classifications[i].genre;
      if (!genre) genre = "Unknown";
      cached.set(artist.id, genre);
      ops.push({
        updateOne: {
          filter: { spotifyArtistId: artist.id },
          update: {
            $set: { name: artist.name, genre, classifiedAt: new Date() },
            $setOnInsert: { spotifyArtistId: artist.id },
          },
          upsert: true,
        },
      });
    });

    if (ops.length > 0) {
      try {
        await ArtistGenre.bulkWrite(ops, { ordered: false });
      } catch (err) {
        console.warn("classifyArtists: bulkWrite failed:", err?.message);
      }
    }
  }

  return cleaned.map((a) => ({
    artistId: a.id,
    name: a.name,
    genre: cached.get(a.id) || "Unknown",
  }));
}
