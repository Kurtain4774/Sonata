import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import { mapPromptApiDetail } from "@/lib/promptMappers";
import { jsonOk, requireApiSession } from "@/lib/api";

export async function GET(_req, { params }) {
  const { session, response } = await requireApiSession({ rejectRefreshError: false });
  if (response) return response;

  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const p = await Prompt.findOne({ _id: params.id, userId: user._id }).lean();
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return jsonOk(mapPromptApiDetail(p));
}
