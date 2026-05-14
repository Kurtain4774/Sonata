import { describe, it, expect } from "vitest";
import {
  mapPromptApiDetail,
  mapPromptPlaylistDetail,
  mapPromptSummary,
  promptThumbnails,
} from "./promptMappers";

const oid = { toString: () => "p1" };
const createdAt = new Date("2026-05-14T12:00:00Z");

describe("prompt mappers", () => {
  it("keeps thumbnail behavior limited to the first five recommendations", () => {
    expect(
      promptThumbnails([
        { albumArt: "img1" },
        { albumArt: null },
        { albumArt: "img2" },
        { albumArt: "img3" },
        { albumArt: "img4" },
        { albumArt: "img5" },
      ])
    ).toEqual(["img1", "img2", "img3", "img4"]);
  });

  it("maps prompt summaries with optional tracks", () => {
    const summary = mapPromptSummary(
      {
        _id: oid,
        promptText: "chill",
        playlistName: "Mix",
        recommendations: [{ uri: "u", title: "T", artist: "A", albumArt: "" }],
        savedAsPlaylist: true,
        spotifyPlaylistUrl: "url",
        createdAt,
      },
      { includeTracks: true, includeSpotifyUrl: false }
    );

    expect(summary).toEqual({
      id: "p1",
      promptText: "chill",
      playlistName: "Mix",
      trackCount: 1,
      thumbnails: [],
      tracks: [{ uri: "u", title: "T", artist: "A", albumArt: null }],
      savedAsPlaylist: true,
      createdAt,
    });
  });

  it("maps API detail responses", () => {
    expect(
      mapPromptApiDetail({
        _id: oid,
        promptText: "p",
        playlistName: "Mix",
        recommendations: [{ uri: "u" }],
        savedAsPlaylist: false,
        spotifyPlaylistId: "pl",
        spotifyPlaylistUrl: "url",
        createdAt,
      })
    ).toEqual({
      id: "p1",
      promptText: "p",
      playlistName: "Mix",
      tracks: [{ uri: "u" }],
      savedAsPlaylist: false,
      spotifyPlaylistId: "pl",
      spotifyPlaylistUrl: "url",
      createdAt,
    });
  });

  it("maps playlist detail defaults", () => {
    const detail = mapPromptPlaylistDetail({
      _id: oid,
      promptText: "prompt",
      recommendations: [
        {
          uri: "u",
          title: "T",
          artist: "A",
          durationMs: undefined,
          matchScore: undefined,
        },
      ],
      refinementHistory: [{ followUp: "more" }],
      createdAt,
    });

    expect(detail.playlistName).toBe("prompt");
    expect(detail.playlistDescription).toBe("");
    expect(detail.savedAsPlaylist).toBe(false);
    expect(detail.spotifyPlaylistUrl).toBeNull();
    expect(detail.refinementHistory[0]).toEqual({
      followUp: "more",
      shortcutsApplied: [],
      excludedArtists: [],
      appliedAt: undefined,
    });
    expect(detail.recommendations[0].durationMs).toBeNull();
  });
});
