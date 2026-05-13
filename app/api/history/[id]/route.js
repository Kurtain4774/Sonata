import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";

export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const p = await Prompt.findOne({ _id: params.id, userId: user._id }).lean();
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: p._id.toString(),
    promptText: p.promptText,
    playlistName: p.playlistName,
    tracks: p.recommendations || [],
    savedAsPlaylist: p.savedAsPlaylist,
    spotifyPlaylistId: p.spotifyPlaylistId,
    spotifyPlaylistUrl: p.spotifyPlaylistUrl,
    createdAt: p.createdAt,
  });
}
