import { getSimilarRecommendations } from "@/lib/gemini";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Prompt from "@/models/Prompt";
import { jsonError, jsonOk, readJsonBody, requireApiSession } from "@/lib/api";
import { mapRecommendError } from "@/lib/recommendHelpers";
import { searchAndEnrichTracks } from "@/lib/recommendationPipeline";

export async function POST(req) {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const { body, response: invalidJson } = await readJsonBody(req);
  if (invalidJson) return invalidJson;

  const { promptId, currentTracks } = body || {};

  try {
    let tracks = currentTracks;
    if (!Array.isArray(tracks) || tracks.length === 0) {
      if (!promptId) {
        return jsonError("promptId or currentTracks required", 400);
      }
      await connectDB();
      const user = await User.findOne({ spotifyId: session.spotifyId });
      if (!user) return jsonError("User not found", 404);
      const doc = await Prompt.findOne({ _id: promptId, userId: user._id }).lean();
      if (!doc) return jsonError("Playlist not found", 404);
      tracks = doc.recommendations || [];
    }

    if (!tracks.length) {
      return jsonOk({ tracks: [] });
    }

    const items = await getSimilarRecommendations(tracks, 20);
    const enriched = await searchAndEnrichTracks(session.accessToken, items, {
      existingUris: tracks.map((track) => track.uri),
    });

    return jsonOk({ tracks: enriched });
  } catch (err) {
    const mapped = mapRecommendError(err);
    if (mapped) return mapped;
    console.error("/api/recommend/similar failed", err);
    return jsonError("Similar fetch failed", 500);
  }
}
