import { jsonOk, requireApiSession } from "@/lib/api";
import { getStatsSummary } from "@/lib/stats";
import { getRecentHistory } from "@/lib/history";
import { getExploreItems } from "@/lib/explore";
import { getDeezerChart } from "@/lib/deezer";

export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const [stats, history, explore, moods] = await Promise.all([
    getStatsSummary(session).catch((err) => {
      console.warn("/api/dashboard stats failed:", err?.message);
      return null;
    }),
    getRecentHistory(session.spotifyId).catch((err) => {
      console.warn("/api/dashboard history failed:", err?.message);
      return { prompts: [] };
    }),
    getExploreItems(1).catch((err) => {
      console.warn("/api/dashboard explore failed:", err?.message);
      return { items: [], page: 1, hasMore: false };
    }),
    getDeezerChart(6).catch((err) => {
      console.warn("/api/dashboard moods failed:", err?.message);
      return { playlists: [], tracks: [] };
    }),
  ]);

  return jsonOk({ stats, history, explore, moods });
}
