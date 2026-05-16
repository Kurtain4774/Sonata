import { getSwapRecommendation } from "@/lib/gemini";
import { rateLimit } from "@/lib/rateLimit";
import { RATE_LIMITS } from "@/lib/rateLimits";
import { jsonError, jsonOk, readJsonBody, requireApiSession, rateLimitResponse } from "@/lib/api";
import { parseExcludedArtists, mapRecommendError } from "@/lib/recommendHelpers";
import { searchAndEnrichTrack } from "@/lib/recommendationPipeline";

export async function POST(req) {
  const { session, response } = await requireApiSession();
  if (response) return response;

  const { body, response: invalidJson } = await readJsonBody(req);
  if (invalidJson) return invalidJson;

  const rl = rateLimit(`swap:${session.spotifyId}`, RATE_LIMITS.swap);
  if (!rl.ok) {
    return rateLimitResponse(rl);
  }

  const originalPrompt = (body?.originalPrompt || "").toString().trim();
  const currentTracks = body?.currentTracks;
  const trackToReplace = body?.trackToReplace;
  const excludedArtists = parseExcludedArtists(body);

  if (!originalPrompt) {
    return jsonError("originalPrompt is required", 400);
  }
  if (!Array.isArray(currentTracks) || currentTracks.length === 0) {
    return jsonError("currentTracks must be a non-empty array", 400);
  }
  if (!trackToReplace?.title || !trackToReplace?.artist) {
    return jsonError("trackToReplace must include title and artist", 400);
  }

  try {
    const existingKeys = new Set(
      currentTracks.map((track) =>
        `${(track.title || "").toLowerCase()}|${(track.artist || "").toLowerCase()}`
      )
    );

    let suggestion = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const candidate = await getSwapRecommendation(
        originalPrompt,
        currentTracks,
        trackToReplace,
        excludedArtists
      );
      const key = `${candidate.title.toLowerCase()}|${candidate.artist.toLowerCase()}`;
      if (!existingKeys.has(key)) {
        suggestion = candidate;
        break;
      }
    }
    if (!suggestion) {
      return jsonError("Could not find a suitable replacement", 502);
    }

    const matched = await searchAndEnrichTrack(session.accessToken, suggestion);
    if (!matched) {
      return jsonError("No Spotify match for replacement", 502);
    }

    return jsonOk({ track: matched });
  } catch (err) {
    const mapped = mapRecommendError(err);
    if (mapped) return mapped;
    console.error("/api/recommend/swap failed", err);
    return jsonError("Swap failed", 500);
  }
}
