import PlayHistory from "@/models/PlayHistory";
import { getRecentlyPlayed, SpotifyAuthError } from "@/lib/spotify";

export async function syncRecentPlays(user, accessToken) {
  if (!user?._id || !accessToken) return 0;

  try {
    const latest = await PlayHistory.findOne({ userId: user._id })
      .sort({ playedAt: -1 })
      .select("playedAt")
      .lean();
    const latestAt = latest?.playedAt ? new Date(latest.playedAt).getTime() : 0;

    const recent = await getRecentlyPlayed(accessToken, 50);
    const fresh = recent
      .filter((r) => r.playedAt && new Date(r.playedAt).getTime() > latestAt)
      .map((r) => ({
        userId: user._id,
        trackId: r.id,
        playedAt: new Date(r.playedAt),
        durationMs: r.durationMs || 0,
        title: r.title,
        artist: r.artist,
      }));

    if (!fresh.length) return 0;

    try {
      const res = await PlayHistory.insertMany(fresh, { ordered: false });
      return res.length;
    } catch (err) {
      // Duplicate-key races are expected; return whatever inserted.
      return err?.insertedDocs?.length || 0;
    }
  } catch (err) {
    if (!(err instanceof SpotifyAuthError)) {
      console.warn("syncRecentPlays failure:", err?.message);
    }
    return 0;
  }
}
