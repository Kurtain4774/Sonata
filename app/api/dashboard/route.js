import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStatsSummary } from "@/lib/stats";
import { getRecentHistory } from "@/lib/history";
import { getExploreItems } from "@/lib/explore";
import { getDeezerChart } from "@/lib/deezer";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.error === "RefreshAccessTokenError") {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

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

  return NextResponse.json({ stats, history, explore, moods });
}
