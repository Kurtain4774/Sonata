import { jsonOk, requireApiSession } from "@/lib/api";
import { getExploreItems } from "@/lib/explore";

export const dynamic = "force-dynamic";

export async function GET() {
  const { response } = await requireApiSession();
  if (response) return response;

  try {
    const data = await getExploreItems(1);
    return jsonOk({ data });
  } catch (err) {
    console.warn("/api/dashboard/explore failed:", err?.message);
    return jsonOk({
      data: { items: [], page: 1, hasMore: false },
      error: err?.message || "explore failed",
    });
  }
}
