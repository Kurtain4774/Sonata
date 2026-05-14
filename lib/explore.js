import { connectDB } from "@/lib/mongodb";
import Prompt from "@/models/Prompt";

export const EXPLORE_PAGE_SIZE = 50;

export async function getExploreItems(page = 1) {
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * EXPLORE_PAGE_SIZE;

  await connectDB();

  const prompts = await Prompt.find({ sharedToExplore: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(EXPLORE_PAGE_SIZE)
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

  return { items, page: safePage, hasMore: items.length === EXPLORE_PAGE_SIZE };
}
