import { getDeezerPreview } from "@/lib/deezer";
import { searchTrack, searchTracks } from "@/lib/spotify";
import { isExcludedArtist } from "@/lib/recommendHelpers";

export function filterExcludedArtists(tracks, excludedArtists = []) {
  if (!excludedArtists.length) return tracks;

  const excludedArtistLowers = new Set(excludedArtists.map((a) => a.toLowerCase()));
  return tracks.filter((track) => !isExcludedArtist(track, excludedArtistLowers));
}

export function filterExistingUris(tracks, existingUris = []) {
  if (!existingUris.length) return tracks;

  const existing = new Set(existingUris.filter(Boolean));
  return tracks.filter((track) => !track.uri || !existing.has(track.uri));
}

export async function attachPreview(track, { preferExistingPreview = true } = {}) {
  if (!track) return null;
  if (preferExistingPreview && track.previewUrl) return track;

  return {
    ...track,
    previewUrl: await getDeezerPreview(track.title, track.artist),
  };
}

export async function attachPreviews(tracks, options) {
  return Promise.all(tracks.map((track) => attachPreview(track, options)));
}

export async function searchAndEnrichTracks(
  accessToken,
  items,
  { excludedArtists = [], existingUris = [], preferExistingPreview = true } = {}
) {
  const matched = await searchTracks(accessToken, items);
  const filtered = filterExistingUris(
    filterExcludedArtists(matched, excludedArtists),
    existingUris
  );

  return attachPreviews(filtered, { preferExistingPreview });
}

export async function searchAndEnrichTrack(
  accessToken,
  item,
  { preferExistingPreview = true } = {}
) {
  const matched = await searchTrack(accessToken, item.title, item.artist);
  if (!matched) return null;

  return attachPreview(matched, { preferExistingPreview });
}
