import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import Settings from "@/models/Settings";
import { mergeWithDefaults } from "@/lib/settings";
import { rateLimit } from "@/lib/rateLimit";
import { RATE_LIMITS } from "@/lib/rateLimits";
import { jsonError, requireApiSession } from "@/lib/api";

export async function GET() {
  const { session, response } = await requireApiSession({ rejectRefreshError: false });
  if (response) return response;

  const rl = rateLimit(`export:${session.spotifyId}`, RATE_LIMITS.settingsExport);
  if (!rl.ok) {
    return jsonError("Too many export requests. Try again shortly.", 429, {
      headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
    });
  }

  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId }).lean();
  if (!user) {
    return jsonError("User not found", 404);
  }

  const [prompts, settingsDoc] = await Promise.all([
    Prompt.find({ userId: user._id }).sort({ createdAt: -1 }).lean(),
    Settings.findOne({ userId: user._id }).lean(),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    user: {
      displayName: user.displayName,
      email: user.email,
      spotifyId: user.spotifyId,
    },
    settings: mergeWithDefaults(settingsDoc),
    prompts: prompts.map((p) => ({
      id: p._id.toString(),
      promptText: p.promptText,
      playlistName: p.playlistName,
      context: p.context,
      recommendations: p.recommendations,
      savedAsPlaylist: p.savedAsPlaylist,
      spotifyPlaylistId: p.spotifyPlaylistId,
      spotifyPlaylistUrl: p.spotifyPlaylistUrl,
      sharedToExplore: p.sharedToExplore,
      isPublic: p.isPublic,
      createdAt: p.createdAt,
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="sonata-export.json"',
    },
  });
}
