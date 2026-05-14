import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import { getTopArtists, getRecentlyPlayed, SpotifyAuthError } from "@/lib/spotify";
import { deriveTasteTags, topGenresFromArtists } from "@/lib/tasteProfile";

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

  try {
    const [artists, recent] = await Promise.all([
      getTopArtists(session.accessToken, "medium_term", 50).catch(() => []),
      getRecentlyPlayed(session.accessToken, 50).catch(() => []),
    ]);
    topGenres = topGenresFromArtists(artists);
    tasteTags = deriveTasteTags(artists.flatMap((a) => a.genres || []));
    listeningStreak = computeStreak(recent);

    const AVG_MS = 3.5 * 60 * 1000;
    const weekCount = recent.filter(
      (r) => r.playedAt && Date.now() - new Date(r.playedAt).getTime() < WEEK_MS
    ).length;
    timeListened = { totalMs: recent.length * AVG_MS, weekMs: weekCount * AVG_MS };
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

  cache.set(spotifyId, { at: Date.now(), data });
  return data;
}
