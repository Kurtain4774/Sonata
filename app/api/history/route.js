import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId });
  if (!user) return NextResponse.json({ prompts: [] });

  const prompts = await Prompt.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json({
    prompts: prompts.map((p) => ({
      id: p._id.toString(),
      promptText: p.promptText,
      playlistName: p.playlistName,
      trackCount: p.recommendations?.length || 0,
      thumbnails: (p.recommendations || []).slice(0, 5).map((t) => t.albumArt).filter(Boolean),
      savedAsPlaylist: p.savedAsPlaylist,
      spotifyPlaylistUrl: p.spotifyPlaylistUrl,
      createdAt: p.createdAt,
    })),
  });
}
