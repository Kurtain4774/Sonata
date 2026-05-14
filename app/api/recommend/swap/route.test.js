import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq, mockSession } from "@/__mocks__/testHelpers";

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/gemini", () => ({
  getSwapRecommendation: vi.fn(),
  GeminiParseError: class GeminiParseError extends Error {},
  GeminiUnavailableError: class GeminiUnavailableError extends Error {},
}));
vi.mock("@/lib/spotify", () => ({
  searchTrack: vi.fn(),
  SpotifyAuthError: class SpotifyAuthError extends Error {},
}));
vi.mock("@/lib/deezer", () => ({ getDeezerPreview: vi.fn() }));

const { getServerSession } = await import("next-auth");
const { getSwapRecommendation } = await import("@/lib/gemini");
const { searchTrack } = await import("@/lib/spotify");
const { getDeezerPreview } = await import("@/lib/deezer");
const { POST } = await import("./route");

const validBody = {
  originalPrompt: "chill",
  currentTracks: [{ title: "Song A", artist: "Artist A" }],
  trackToReplace: { title: "Song A", artist: "Artist A" },
};

describe("POST /api/recommend/swap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue(mockSession({ spotifyId: `swap-${Math.random()}` }));
  });

  it("401 with no session", async () => {
    getServerSession.mockResolvedValueOnce(null);
    expect((await POST(makeReq(validBody))).status).toBe(401);
  });

  it("400 with invalid JSON", async () => {
    expect((await POST(makeReq("nope"))).status).toBe(400);
  });

  it("400 when originalPrompt missing", async () => {
    expect((await POST(makeReq({ ...validBody, originalPrompt: "" }))).status).toBe(400);
  });

  it("400 when currentTracks empty", async () => {
    expect((await POST(makeReq({ ...validBody, currentTracks: [] }))).status).toBe(400);
  });

  it("400 when trackToReplace missing title/artist", async () => {
    expect(
      (await POST(makeReq({ ...validBody, trackToReplace: { title: "x" } }))).status
    ).toBe(400);
  });

  it("502 when 3 candidates are all duplicates", async () => {
    getSwapRecommendation.mockResolvedValue({ title: "Song A", artist: "Artist A" });
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(502);
    expect(getSwapRecommendation).toHaveBeenCalledTimes(3);
  });

  it("502 when Spotify has no match", async () => {
    getSwapRecommendation.mockResolvedValue({ title: "New", artist: "B" });
    searchTrack.mockResolvedValue(null);
    expect((await POST(makeReq(validBody))).status).toBe(502);
  });

  it("returns swap with Deezer fallback when Spotify preview missing", async () => {
    getSwapRecommendation.mockResolvedValue({ title: "New", artist: "B" });
    searchTrack.mockResolvedValue({ title: "New", artist: "B", uri: "u", previewUrl: null });
    getDeezerPreview.mockResolvedValue("https://deezer/p");
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.track.previewUrl).toBe("https://deezer/p");
  });

  it("uses Spotify previewUrl when present (no Deezer call)", async () => {
    getSwapRecommendation.mockResolvedValue({ title: "New", artist: "B" });
    searchTrack.mockResolvedValue({ title: "New", artist: "B", uri: "u", previewUrl: "spotify-prev" });
    const res = await POST(makeReq(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.track.previewUrl).toBe("spotify-prev");
    expect(getDeezerPreview).not.toHaveBeenCalled();
  });
});
