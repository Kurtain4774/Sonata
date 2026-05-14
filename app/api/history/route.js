import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import { getRecentHistory } from "@/lib/history";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const data = await getRecentHistory(session.spotifyId);
  return NextResponse.json(data);
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId });
  if (!user) return NextResponse.json({ deleted: 0 });

  const result = await Prompt.deleteMany({ userId: user._id });
  return NextResponse.json({ deleted: result.deletedCount || 0 });
}
