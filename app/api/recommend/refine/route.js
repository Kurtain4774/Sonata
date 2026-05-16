import { getRefinedRecommendations } from "@/lib/gemini";
import { rateLimit } from "@/lib/rateLimit";
import { RATE_LIMITS } from "@/lib/rateLimits";
import { jsonError, jsonOk, readJsonBody, requireApiSession, rateLimitResponse } from "@/lib/api";
import { parseExcludedArtists, mapRecommendError } from "@/lib/recommendHelpers";
import { searchAndEnrichTracks } from "@/lib/recommendationPipeline";

export async function POST(req) {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const { body, response: invalidJson } = await readJsonBody(req);
  if (invalidJson) return invalidJson;

  const rl = rateLimit(`refine:${session.spotifyId}`, RATE_LIMITS.refine);
  if (!rl.ok) {
    return rateLimitResponse(rl);
  }

  const originalPrompt = (body?.originalPrompt || "").toString().trim();
  const followUp = (body?.followUp || "").toString().trim();
  const currentTracks = body?.currentTracks;
  const excludedArtists = parseExcludedArtists(body);

  if (!originalPrompt || !followUp) {
    return jsonError("originalPrompt and followUp are required", 400);
  }
  if (!Array.isArray(currentTracks) || currentTracks.length === 0) {
    return jsonError("currentTracks must be a non-empty array", 400);
  }
  if (followUp.length > 500) {
    return jsonError("Follow-up too long (max 500 chars)", 400);
  }

  try {
    const items = await getRefinedRecommendations(
      originalPrompt,
      currentTracks,
      followUp,
      excludedArtists
    );
    const tracks = await searchAndEnrichTracks(session.accessToken, items, {
      excludedArtists,
      preferExistingPreview: false,
    });

    return jsonOk({ tracks });
  } catch (err) {
    const mapped = mapRecommendError(err);
    if (mapped) return mapped;
    console.error("/api/recommend/refine failed", err);
    return jsonError("Refinement failed", 500);
  }
}
