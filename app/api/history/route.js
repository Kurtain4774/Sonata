import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import { getRecentHistory } from "@/lib/history";
import { jsonOk, requireApiSession } from "@/lib/api";

export async function GET() {
  const { session, response } = await requireApiSession({ rejectRefreshError: false });
  if (response) return response;

  const data = await getRecentHistory(session.spotifyId);
  return jsonOk(data);
}

export async function DELETE() {
  const { session, response } = await requireApiSession({ rejectRefreshError: false });
  if (response) return response;

  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId });
  if (!user) return jsonOk({ deleted: 0 });

  const result = await Prompt.deleteMany({ userId: user._id });
  return jsonOk({ deleted: result.deletedCount || 0 });
}
