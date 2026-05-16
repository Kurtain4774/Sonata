// Shared helpers for working with track objects ({ title, artist, ... }).

// A track's primary artist (the first of a comma-separated artist string).
export function getFirstArtist(track) {
  return (track?.artist || "").split(",")[0]?.trim() || "";
}

// Stable identity key for a track, used to dedupe and match across recommendation passes.
export function songKey(track) {
  return `${(track?.title || "").toLowerCase()}|${(track?.artist || "").toLowerCase()}`;
}
