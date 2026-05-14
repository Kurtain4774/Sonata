import { jsonOk, requireApiSession } from "@/lib/api";
import { getStatsSummary } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const data = await getStatsSummary(session);
  return jsonOk(data);
}
