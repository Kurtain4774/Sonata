import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";

export async function getRecentHistory(spotifyId, limit = 50) {
  await connectDB();
  const user = await User.findOne({ spotifyId });
  if (!user) return { prompts: [] };

  const prompts = await Prompt.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return {
    prompts: prompts.map((p) => ({
      id: p._id.toString(),
      promptText: p.promptText,
      playlistName: p.playlistName,
      trackCount: p.recommendations?.length || 0,
      thumbnails: (p.recommendations || [])
        .slice(0, 5)
        .map((t) => t.albumArt)
        .filter(Boolean),
      savedAsPlaylist: p.savedAsPlaylist,
      spotifyPlaylistUrl: p.spotifyPlaylistUrl,
      createdAt: p.createdAt,
    })),
  };
}
