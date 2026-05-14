import { describe, it, expect } from "vitest";
import { buildTrackSearchQuery, mapSpotifyTrack } from "./spotifyTrackMapper";

describe("buildTrackSearchQuery", () => {
  it("formats Spotify search query string", () => {
    expect(buildTrackSearchQuery("Song", "Artist")).toBe(
      'track:"Song" artist:"Artist"'
    );
  });
});

const fixtureItem = {
  id: "abc",
  uri: "spotify:track:abc",
  name: "Song",
  artists: [{ name: "Artist" }, { name: "Feature" }],
  album: { name: "Album", images: [{ url: "https://img/large" }, { url: "small" }] },
  preview_url: "https://preview",
  external_urls: { spotify: "https://open.spotify.com/track/abc" },
  explicit: true,
  duration_ms: 200000,
};

describe("mapSpotifyTrack", () => {
  it("returns null for null item", () => {
    expect(mapSpotifyTrack(null, "T", "A")).toBeNull();
  });

  it("maps a Spotify item with all fields", () => {
    const m = mapSpotifyTrack(fixtureItem, "Song", "Artist");
    expect(m.spotifyTrackId).toBe("abc");
    expect(m.uri).toBe("spotify:track:abc");
    expect(m.title).toBe("Song");
    expect(m.artist).toBe("Artist, Feature");
    expect(m.album).toBe("Album");
    expect(m.albumArt).toBe("https://img/large");
    expect(m.previewUrl).toBe("https://preview");
    expect(m.explicit).toBe(true);
    expect(m.durationMs).toBe(200000);
    expect(m.matchScore).toBe(100);
    expect(m.moodFit).toBe("Perfect");
  });

  it("handles missing nested fields safely", () => {
    const sparse = { id: "x", uri: "u", name: "n", artists: [], album: null };
    const m = mapSpotifyTrack(sparse, "n", "");
    expect(m.artist).toBe("");
    expect(m.album).toBeNull();
    expect(m.albumArt).toBeNull();
    expect(m.durationMs).toBeNull();
    expect(m.explicit).toBe(false);
  });

  it("omits matchScore when includeMatch=false", () => {
    const m = mapSpotifyTrack(fixtureItem, "Song", "Artist", { includeMatch: false });
    expect(m).not.toHaveProperty("matchScore");
    expect(m).not.toHaveProperty("moodFit");
  });
});
