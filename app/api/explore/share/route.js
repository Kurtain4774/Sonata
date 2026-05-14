import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import { rateLimit } from "@/lib/rateLimit";
import { jsonError, jsonOk, readJsonBody, requireApiSession } from "@/lib/api";

export async function PATCH(req) {
  const { session, response } = await requireApiSession({ rejectRefreshError: false });
  if (response) return response;

  const rl = rateLimit(`explore-share:${session.spotifyId}`, { limit: 20, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const { body, response: invalidJson } = await readJsonBody(req);
  if (invalidJson) return invalidJson;

  const { promptId, shared } = body || {};
  if (!promptId || typeof shared !== "boolean") {
    return jsonError("Missing promptId or shared", 400);
  }

  await connectDB();
  const user = await User.findOne({ spotifyId: session.spotifyId });
  if (!user) return jsonError("User not found", 404);

  const prompt = await Prompt.findOneAndUpdate(
    { _id: promptId, userId: user._id },
    { sharedToExplore: shared },
    { new: true }
  );
  if (!prompt) return jsonError("Prompt not found", 404);

  return jsonOk({ sharedToExplore: prompt.sharedToExplore });
}
