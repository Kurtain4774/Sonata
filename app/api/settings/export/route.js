import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import Settings from "@/models/Settings";
import { mergeWithDefaults } from "@/lib/settings";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId }).lean();
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
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
      "Content-Disposition": 'attachment; filename="soundsage-export.json"',
    },
  });
}
