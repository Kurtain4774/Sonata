import { jsonOk, requireApiSession } from "@/lib/api";
import { getRecentHistory } from "@/lib/history";

export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireApiSession();
  if (response) return response;

  try {
    const data = await getRecentHistory(session.spotifyId);
    return jsonOk({ data });
  } catch (err) {
    console.warn("/api/dashboard/history failed:", err?.message);
    return jsonOk({ data: { prompts: [] }, error: err?.message || "history failed" });
  }
}
