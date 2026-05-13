import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Prompt from "@/models/Prompt";
import User from "@/models/User";

const PAGE_SIZE = 50;

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  await connectDB();

  const prompts = await Prompt.find({ sharedToExplore: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(PAGE_SIZE)
    .populate("userId", "displayName profileImage")
    .lean();

  const items = prompts.map((p) => ({
    id: p._id.toString(),
    promptText: p.promptText,
    trackCount: (p.recommendations || []).length,
    thumbnails: (p.recommendations || [])
      .map((t) => t.albumArt)
      .filter(Boolean)
      .slice(0, 5),
    username: p.userId?.displayName || "Someone",
    createdAt: p.createdAt,
  }));

  return NextResponse.json({ items, page, hasMore: items.length === PAGE_SIZE });
}
