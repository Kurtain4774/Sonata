import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Settings from "@/models/Settings";
import {
  DEFAULT_SETTINGS,
  mergeWithDefaults,
  sanitizeSettingsPatch,
} from "@/lib/settings";

async function getCurrentUser(session) {
  await connectDB();
  return User.findOne({ spotifyId: session.spotifyId });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await getCurrentUser(session);
  if (!user) return NextResponse.json({ settings: DEFAULT_SETTINGS });

  let doc = await Settings.findOne({ userId: user._id }).lean();
  if (!doc) {
    doc = (await Settings.create({ userId: user._id })).toObject();
  }
  return NextResponse.json({ settings: mergeWithDefaults(doc) });
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const patch = sanitizeSettingsPatch(body);

  const user = await getCurrentUser(session);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const doc = await Settings.findOneAndUpdate(
    { userId: user._id },
    { $set: patch, $setOnInsert: { userId: user._id } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return NextResponse.json({ settings: mergeWithDefaults(doc) });
}
