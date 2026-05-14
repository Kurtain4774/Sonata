import { NextResponse } from "next/server";
import { SpotifyAuthError } from "./spotify";
import { GeminiParseError, GeminiUnavailableError } from "./gemini";

export function parseExcludedArtists(body) {
  return Array.isArray(body?.excludedArtists)
    ? body.excludedArtists
        .map((a) => (typeof a === "string" ? a.trim() : ""))
        .filter(Boolean)
        .slice(0, 50)
    : [];
}

export function isExcludedArtist(track, excludedArtistLowers) {
  if (!excludedArtistLowers?.size) return false;
  const artists = (track.artist || "").split(",").map((s) => s.trim().toLowerCase());
  return artists.some((a) => excludedArtistLowers.has(a));
}

// Maps the three known recommendation-pipeline errors to NextResponses.
// Returns null for unknown errors so callers can log + send their own 500.
export function mapRecommendError(err) {
  if (err instanceof SpotifyAuthError) {
    return NextResponse.json(
      { error: "Spotify session expired — please log in again." },
      { status: 401 }
    );
  }
  if (err instanceof GeminiParseError) {
    return NextResponse.json(
      { error: "The AI returned an unreadable response. Try again." },
      { status: 502 }
    );
  }
  if (err instanceof GeminiUnavailableError) {
    return NextResponse.json(
      { error: "AI is busy right now. Please try again in a moment." },
      {
        status: 503,
        headers: { "Retry-After": String(Math.ceil((err.retryAfterMs || 2000) / 1000)) },
      }
    );
  }
  return null;
}
