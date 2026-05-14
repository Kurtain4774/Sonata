import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Settings from "@/models/Settings";
import {
  DEFAULT_SETTINGS,
  mergeWithDefaults,
  sanitizeSettingsPatch,
} from "@/lib/settings";
import { jsonError, jsonOk, readJsonBody, requireApiSession } from "@/lib/api";

async function getCurrentUser(session) {
  await connectDB();
  return User.findOne({ spotifyId: session.spotifyId });
}

export async function GET() {
  const { session, response } = await requireApiSession({ rejectRefreshError: false });
  if (response) return response;

  const user = await getCurrentUser(session);
  if (!user) return jsonOk({ settings: DEFAULT_SETTINGS });

  let doc = await Settings.findOne({ userId: user._id }).lean();
  if (!doc) {
    doc = (await Settings.create({ userId: user._id })).toObject();
  }
  return jsonOk({ settings: mergeWithDefaults(doc) });
}

export async function PUT(req) {
  const { session, response } = await requireApiSession({ rejectRefreshError: false });
  if (response) return response;

  const { body, response: invalidJson } = await readJsonBody(req);
  if (invalidJson) return invalidJson;
  const patch = sanitizeSettingsPatch(body);

  const user = await getCurrentUser(session);
  if (!user) return jsonError("User not found", 404);

  const doc = await Settings.findOneAndUpdate(
    { userId: user._id },
    { $set: patch, $setOnInsert: { userId: user._id } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return jsonOk({ settings: mergeWithDefaults(doc) });
}
