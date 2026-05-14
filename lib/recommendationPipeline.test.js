import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/deezer", () => ({
  getDeezerPreview: vi.fn(),
}));
vi.mock("@/lib/spotify", () => ({
  searchTrack: vi.fn(),
  searchTracks: vi.fn(),
}));

const { getDeezerPreview } = await import("@/lib/deezer");
const { searchTrack, searchTracks } = await import("@/lib/spotify");
const {
  attachPreview,
  filterExcludedArtists,
  filterExistingUris,
  searchAndEnrichTrack,
  searchAndEnrichTracks,
} = await import("./recommendationPipeline");

describe("recommendation pipeline helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDeezerPreview.mockResolvedValue("deezer-preview");
  });

  it("filters tracks by excluded artists", () => {
    const tracks = [
      { title: "A", artist: "Blocked, Other" },
      { title: "B", artist: "Allowed" },
    ];

    expect(filterExcludedArtists(tracks, ["Blocked"])).toEqual([tracks[1]]);
  });

  it("filters tracks by existing URIs while keeping URI-less tracks", () => {
    const tracks = [{ uri: "u1" }, { uri: "u2" }, { title: "No URI" }];
    expect(filterExistingUris(tracks, ["u1"])).toEqual([tracks[1], tracks[2]]);
  });

  it("keeps existing previews by default", async () => {
    const track = { title: "T", artist: "A", previewUrl: "spotify-preview" };
    await expect(attachPreview(track)).resolves.toBe(track);
    expect(getDeezerPreview).not.toHaveBeenCalled();
  });

  it("can force Deezer preview replacement", async () => {
    const track = { title: "T", artist: "A", previewUrl: "spotify-preview" };
    await expect(
      attachPreview(track, { preferExistingPreview: false })
    ).resolves.toEqual({ ...track, previewUrl: "deezer-preview" });
  });

  it("searches, filters, and enriches multiple tracks", async () => {
    searchTracks.mockResolvedValue([
      { title: "A", artist: "Blocked", uri: "u1" },
      { title: "B", artist: "Allowed", uri: "u2" },
      { title: "C", artist: "Allowed", uri: "u3" },
    ]);

    const tracks = await searchAndEnrichTracks("tok", [{ title: "x", artist: "y" }], {
      excludedArtists: ["Blocked"],
      existingUris: ["u2"],
    });

    expect(tracks).toEqual([
      { title: "C", artist: "Allowed", uri: "u3", previewUrl: "deezer-preview" },
    ]);
  });

  it("searches and enriches one track", async () => {
    searchTrack.mockResolvedValue({ title: "T", artist: "A", uri: "u" });
    await expect(
      searchAndEnrichTrack("tok", { title: "T", artist: "A" })
    ).resolves.toEqual({ title: "T", artist: "A", uri: "u", previewUrl: "deezer-preview" });
  });
});
