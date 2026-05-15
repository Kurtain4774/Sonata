import { jsonOk, requireApiSession } from "@/lib/api";
import { getDeezerChart } from "@/lib/deezer";

export const dynamic = "force-dynamic";

export async function GET() {
  const { response } = await requireApiSession();
  if (response) return response;

  try {
    const data = await getDeezerChart(6);
    return jsonOk({ data });
  } catch (err) {
    console.warn("/api/dashboard/moods failed:", err?.message);
    return jsonOk({
      data: { playlists: [], tracks: [] },
      error: err?.message || "moods failed",
    });
  }
}
