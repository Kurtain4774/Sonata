import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import {
  getRecentlyPlayed,
  getTopArtists,
  SpotifyAuthError,
} from "@/lib/spotify";
import { deriveTasteTags, topGenresFromArtists } from "@/lib/tasteProfile";
import { classifyArtists } from "@/lib/artistGenres";
import PlayHistory from "@/models/PlayHistory";
import { syncRecentPlays } from "@/lib/playHistory";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const GENRE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_TASTE_TAGS = ["Melodic", "Chill", "Atmospheric", "Upbeat", "Nostalgic"];

function topGenresFromGeminiClassifications(classifications = []) {
  const counts = new Map();
  for (const c of classifications) {
    const genre = (c?.genre || "").trim();
    if (!genre || genre.toLowerCase() === "unknown") continue;
    counts.set(genre, (counts.get(genre) || 0) + 1);
  }
  const total = Array.from(counts.values()).reduce((s, n) => s + n, 0);
  if (total === 0) return [];
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      percent: Math.round((count / total) * 100),
    }));
}

function computeStreak(recent = []) {
  if (!recent.length) return { current: 0, best: 0 };
  const days = new Set(
    recent
      .map((r) => r.playedAt && new Date(r.playedAt).toISOString().slice(0, 10))
      .filter(Boolean)
  );
  if (!days.size) return { current: 0, best: 0 };
  const sorted = Array.from(days).sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const cur = new Date(sorted[i]);
    const diff = Math.round((cur - prev) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  let current = 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    if (days.has(d)) current += 1;
    else if (i === 0) continue;
    else break;
  }
  return { current, best };
}

async function computeAndStoreGenres(user, accessToken) {
  try {
    const artists = await getTopArtists(accessToken, "short_term", 50).catch(() => []);
    if (artists.length === 0) return null;

    const tasteTags = deriveTasteTags(artists.flatMap((a) => a.genres || []));

    let topGenres = [];
    try {
      const classifications = await classifyArtists(
        artists.map((a) => ({ id: a.id, name: a.name })).filter((a) => a.id && a.name)
      );
      topGenres = topGenresFromGeminiClassifications(classifications);
    } catch (err) {
      console.warn("computeAndStoreGenres: classify failed, falling back to Spotify genres:", err?.message);
      topGenres = topGenresFromArtists(artists);
    }

    if (user) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            cachedTopGenres: topGenres,
            cachedTasteTags: tasteTags,
            cachedTopGenresAt: new Date(),
          },
        }
      );
    }
    return { topGenres, tasteTags };
  } catch (err) {
    console.warn("computeAndStoreGenres failed:", err?.message);
    return null;
  }
}

export async function getStatsSummary(session) {
  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId });

  let playlistsGenerated = 0;
  let playlistsGeneratedThisWeek = 0;
  let savedPlaylists = 0;
  let savedPlaylistsThisWeek = 0;

  if (user) {
    const weekAgo = new Date(Date.now() - WEEK_MS);
    [playlistsGenerated, playlistsGeneratedThisWeek, savedPlaylists, savedPlaylistsThisWeek] =
      await Promise.all([
        Prompt.countDocuments({ userId: user._id }),
        Prompt.countDocuments({ userId: user._id, createdAt: { $gte: weekAgo } }),
        Prompt.countDocuments({ userId: user._id, savedAsPlaylist: true }),
        Prompt.countDocuments({
          userId: user._id,
          savedAsPlaylist: true,
          createdAt: { $gte: weekAgo },
        }),
      ]);
  }

  let topGenres = [];
  let tasteTags = DEFAULT_TASTE_TAGS;
  let listeningStreak = { current: 0, best: 0 };
  let timeListened = { totalMs: 0, weekMs: 0 };

  // ── Genre cache: serve cached if present, refresh in background if stale ──
  const hasCache = user?.cachedTopGenres?.length > 0;
  const cacheAge = user?.cachedTopGenresAt
    ? Date.now() - new Date(user.cachedTopGenresAt).getTime()
    : Infinity;
  const cacheFresh = hasCache && cacheAge < GENRE_CACHE_TTL_MS;

  if (hasCache) {
    topGenres = user.cachedTopGenres.map((g) => ({ name: g.name, percent: g.percent }));
    if (user.cachedTasteTags?.length) tasteTags = user.cachedTasteTags;
    if (!cacheFresh) {
      // Stale — refresh in the background. Don't await; the next visit will
      // see the fresh result. If the runtime terminates this promise early,
      // the next request will simply trigger another refresh.
      void computeAndStoreGenres(user, session.accessToken).catch(() => {});
    }
  } else if (user) {
    // No cache at all — first visit. Must await so the widget has data.
    const fresh = await computeAndStoreGenres(user, session.accessToken);
    if (fresh) {
      topGenres = fresh.topGenres;
      tasteTags = fresh.tasteTags;
    }
  }

  try {
    if (user) {
      await syncRecentPlays(user, session.accessToken);
      const since = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const history = await PlayHistory.find({
        userId: user._id,
        playedAt: { $gte: since },
      })
        .select("playedAt durationMs")
        .sort({ playedAt: -1 })
        .lean();

      listeningStreak = computeStreak(history);
      const weekCutoff = Date.now() - WEEK_MS;
      let totalMs = 0;
      let weekMs = 0;
      for (const p of history) {
        const d = p.durationMs || 0;
        totalMs += d;
        if (new Date(p.playedAt).getTime() >= weekCutoff) weekMs += d;
      }
      timeListened = { totalMs, weekMs };
    } else {
      const recent = await getRecentlyPlayed(session.accessToken, 50).catch(() => []);
      listeningStreak = computeStreak(recent);
    }
  } catch (err) {
    if (!(err instanceof SpotifyAuthError)) {
      console.warn("getStatsSummary partial failure:", err?.message);
    }
  }

  const topGenre = topGenres[0]
    ? { name: topGenres[0].name, percent: topGenres[0].percent }
    : { name: "—", percent: 0 };

  return {
    playlistsGenerated,
    playlistsGeneratedThisWeek,
    savedPlaylists,
    savedPlaylistsThisWeek,
    topGenre,
    listeningStreak,
    timeListened,
    topGenres,
    tasteTags,
  };
}
