import { moodFitFromScore } from "./moodFit";
import { trackMatchScore } from "./stringSimilarity";

export function buildTrackSearchQuery(title, artist) {
  return `track:"${title}" artist:"${artist}"`;
}

export function mapSpotifyTrack(item, requestedTitle, requestedArtist, { includeMatch = true } = {}) {
  if (!item) return null;

  const artist = (item.artists || []).map((a) => a.name).join(", ");
  const mapped = {
    spotifyTrackId: item.id,
    uri: item.uri,
    title: item.name,
    artist,
    album: item.album?.name || null,
    albumArt: item.album?.images?.[0]?.url || null,
    previewUrl: item.preview_url,
    spotifyUrl: item.external_urls?.spotify,
    explicit: Boolean(item.explicit),
    durationMs: item.duration_ms ?? null,
  };

  if (!includeMatch) return mapped;

  const matchScore = trackMatchScore(
    requestedTitle,
    requestedArtist,
    item.name,
    item.artists?.[0]?.name || ""
  );

  return {
    ...mapped,
    matchScore,
    moodFit: moodFitFromScore(matchScore),
  };
}
