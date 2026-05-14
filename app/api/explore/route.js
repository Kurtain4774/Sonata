import { NextResponse } from "next/server";
import { getExploreItems } from "@/lib/explore";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const data = await getExploreItems(page);
  return NextResponse.json(data);
}
