import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { promptId, shared } = body || {};
  if (!promptId || typeof shared !== "boolean") {
    return NextResponse.json({ error: "Missing promptId or shared" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const prompt = await Prompt.findOneAndUpdate(
    { _id: promptId, userId: user._id },
    { sharedToExplore: shared },
    { new: true }
  );
  if (!prompt) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });

  return NextResponse.json({ sharedToExplore: prompt.sharedToExplore });
}
