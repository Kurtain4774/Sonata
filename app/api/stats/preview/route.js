import { getDeezerPreview } from "@/lib/deezer";
import { jsonOk, requireApiSession } from "@/lib/api";

export async function GET(req) {
  const { response } = await requireApiSession({ rejectRefreshError: false });
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "";
  const artist = searchParams.get("artist") || "";
  if (!title || !artist) {
    return jsonOk({ previewUrl: null });
  }
  const previewUrl = await getDeezerPreview(title, artist);
  return jsonOk({ previewUrl });
}
