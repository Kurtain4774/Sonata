import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDeezerPreview } from "@/lib/deezer";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "";
  const artist = searchParams.get("artist") || "";
  if (!title || !artist) {
    return NextResponse.json({ previewUrl: null });
  }
  const previewUrl = await getDeezerPreview(title, artist);
  return NextResponse.json({ previewUrl });
}
