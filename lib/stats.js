import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import {
  getArtistsByIds,
  getRecentlyPlayed,
  getTopArtists,
  SpotifyAuthError,
} from "@/lib/spotify";
import { deriveTasteTags, topGenresFromArtists } from "@/lib/tasteProfile";
import PlayHistory from "@/models/PlayHistory";
import { syncRecentPlays } from "@/lib/playHistory";

const cache = new Map();
const TTL_MS = 5 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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

export async function getStatsSummary(session) {
  const spotifyId = session.spotifyId;
  const cached = cache.get(spotifyId);
  if (cached && Date.now() - cached.at < TTL_MS) {
    return cached.data;
  }

  await connectDB();
  const user = await User.findOne({ spotifyId });

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
  let tasteTags = ["Melodic", "Chill", "Atmospheric", "Upbeat", "Nostalgic"];
  let listeningStreak = { current: 0, best: 0 };
  let timeListened = { totalMs: 0, weekMs: 0 };

  let artistsFetched = 0;
  try {
    const recent = await getRecentlyPlayed(session.accessToken, 50).catch((err) => {
      console.warn("getRecentlyPlayed failed:", err?.message);
      return [];
    });
    const artistIds = recent.flatMap((t) => t.artistIds || []);
    const [recentArtists, topShort, topMedium, topLong] = await Promise.all([
      getArtistsByIds(session.accessToken, artistIds).catch(() => []),
      getTopArtists(session.accessToken, "short_term", 50).catch(() => []),
      getTopArtists(session.accessToken, "medium_term", 50).catch(() => []),
      getTopArtists(session.accessToken, "long_term", 50).catch(() => []),
    ]);
    const byId = new Map();
    for (const a of [...recentArtists, ...topShort, ...topMedium, ...topLong]) {
      if (!a?.id) continue;
      const existing = byId.get(a.id);
      if (!existing || (existing.genres?.length || 0) < (a.genres?.length || 0)) {
        byId.set(a.id, a);
      }
    }
    const artists = Array.from(byId.values());
    artistsFetched = artists.length;
    const withGenres = artists.filter((a) => (a.genres || []).length > 0).length;
    topGenres = topGenresFromArtists(artists);
    tasteTags = deriveTasteTags(artists.flatMap((a) => a.genres || []));
    console.info(
      `stats: recent=${recent.length} artistIds=${artistIds.length} artists=${artists.length} withGenres=${withGenres} topGenres=${topGenres.length}`
    );
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

  const data = {
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

  if (topGenres.length > 0 || artistsFetched > 0) {
    cache.set(spotifyId, { at: Date.now(), data });
  } else {
    cache.delete(spotifyId);
  }
  return data;
}
