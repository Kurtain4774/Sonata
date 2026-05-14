import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import { mapPromptSummary } from "@/lib/promptMappers";

export async function getRecentHistory(spotifyId, limit = 50) {
  await connectDB();
  const user = await User.findOne({ spotifyId });
  if (!user) return { prompts: [] };

  const prompts = await Prompt.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return {
    prompts: prompts.map((prompt) => mapPromptSummary(prompt)),
  };
}
