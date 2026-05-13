const MOOD_MAP = [
  { tag: "Melodic", keywords: ["indie", "singer-songwriter", "folk", "acoustic", "ballad", "soft rock"] },
  { tag: "Chill", keywords: ["chill", "lo-fi", "lofi", "ambient", "downtempo", "trip hop", "bedroom"] },
  { tag: "Atmospheric", keywords: ["ambient", "post-rock", "shoegaze", "dream pop", "cinematic", "soundtrack", "score"] },
  { tag: "Upbeat", keywords: ["pop", "dance", "edm", "house", "disco", "funk", "electro"] },
  { tag: "Nostalgic", keywords: ["80s", "70s", "90s", "00s", "throwback", "classic", "oldies", "retro"] },
  { tag: "Heavy", keywords: ["metal", "punk", "hardcore", "rock", "grunge", "thrash"] },
  { tag: "Soulful", keywords: ["soul", "r&b", "neo soul", "motown", "gospel", "blues"] },
  { tag: "Lyrical", keywords: ["hip hop", "rap", "trap", "drill", "grime", "boom bap"] },
];

export function deriveTasteTags(genres = []) {
  if (!genres.length) return ["Melodic", "Chill", "Atmospheric", "Upbeat", "Nostalgic"];
  const lowered = genres.map((g) => (g || "").toLowerCase());
  const scored = MOOD_MAP.map(({ tag, keywords }) => {
    const count = lowered.reduce(
      (n, g) => n + (keywords.some((k) => g.includes(k)) ? 1 : 0),
      0
    );
    return { tag, count };
  });
  const present = scored.filter((s) => s.count > 0).sort((a, b) => b.count - a.count);
  const tags = present.slice(0, 5).map((s) => s.tag);
  const fallback = ["Melodic", "Chill", "Atmospheric", "Upbeat", "Nostalgic"];
  for (const t of fallback) {
    if (tags.length >= 5) break;
    if (!tags.includes(t)) tags.push(t);
  }
  return tags;
}

export function topGenresFromArtists(artists = []) {
  const counts = new Map();
  for (const a of artists) {
    for (const g of a.genres || []) {
      const key = g.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  const total = Array.from(counts.values()).reduce((s, n) => s + n, 0);
  if (total === 0) return [];
  const titleCase = (s) =>
    s
      .split(/\s+/)
      .map((w) => (/^[a-z]/.test(w) ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name: titleCase(name),
      percent: Math.round((count / total) * 100),
    }));
}
