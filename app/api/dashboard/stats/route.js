import { jsonOk, requireApiSession } from "@/lib/api";
import { getStatsSummary } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireApiSession();
  if (response) return response;

  try {
    const data = await getStatsSummary(session);
    return jsonOk({ data });
  } catch (err) {
    console.warn("/api/dashboard/stats failed:", err?.message);
    return jsonOk({ data: null, error: err?.message || "stats failed" });
  }
}
