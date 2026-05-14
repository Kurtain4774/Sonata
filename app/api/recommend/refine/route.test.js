import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq, mockSession } from "@/__mocks__/testHelpers";

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/gemini", () => ({
  getRefinedRecommendations: vi.fn(),
  GeminiParseError: class GeminiParseError extends Error {},
  GeminiUnavailableError: class GeminiUnavailableError extends Error {},
}));
vi.mock("@/lib/spotify", () => ({
  searchTracks: vi.fn(),
  SpotifyAuthError: class SpotifyAuthError extends Error {},
}));
vi.mock("@/lib/deezer", () => ({
  getDeezerPreview: vi.fn().mockResolvedValue("https://deezer/preview"),
}));

const { getServerSession } = await import("next-auth");
const { getRefinedRecommendations, GeminiParseError, GeminiUnavailableError } = await import("@/lib/gemini");
const { searchTracks, SpotifyAuthError } = await import("@/lib/spotify");
const { POST } = await import("./route");

describe("POST /api/recommend/refine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Unique spotifyId per test prevents rateLimit state leakage.
    getServerSession.mockResolvedValue(mockSession({ spotifyId: `refine-${Math.random()}` }));
  });

  it("401 when no session", async () => {
    getServerSession.mockResolvedValueOnce(null);
    const res = await POST(makeReq({}));
    expect(res.status).toBe(401);
  });

  it("401 on RefreshAccessTokenError", async () => {
    getServerSession.mockResolvedValueOnce(
      mockSession({ error: "RefreshAccessTokenError" })
    );
    const res = await POST(makeReq({}));
    expect(res.status).toBe(401);
  });

  it("400 on invalid JSON", async () => {
    const res = await POST(makeReq("not-json"));
    expect(res.status).toBe(400);
  });

  it("400 when originalPrompt missing", async () => {
    const res = await POST(
      makeReq({ followUp: "more chill", currentTracks: [{ title: "a", artist: "b" }] })
    );
    expect(res.status).toBe(400);
  });

  it("400 when currentTracks empty", async () => {
    const res = await POST(
      makeReq({ originalPrompt: "p", followUp: "f", currentTracks: [] })
    );
    expect(res.status).toBe(400);
  });

  it("400 when followUp exceeds 500 chars", async () => {
    const res = await POST(
      makeReq({
        originalPrompt: "p",
        followUp: "x".repeat(501),
        currentTracks: [{ title: "a", artist: "b" }],
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns matched tracks with Deezer preview attached", async () => {
    getRefinedRecommendations.mockResolvedValue([{ title: "T", artist: "A" }]);
    searchTracks.mockResolvedValue([
      { title: "T", artist: "A", uri: "spotify:track:1" },
    ]);
    const res = await POST(
      makeReq({
        originalPrompt: "p",
        followUp: "f",
        currentTracks: [{ title: "x", artist: "y" }],
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.tracks).toHaveLength(1);
    expect(data.tracks[0].previewUrl).toBe("https://deezer/preview");
  });

  it("filters excluded artists from results", async () => {
    getRefinedRecommendations.mockResolvedValue([{ title: "T", artist: "A" }]);
    searchTracks.mockResolvedValue([
      { title: "T", artist: "Banned, Other", uri: "u1" },
      { title: "T2", artist: "Allowed", uri: "u2" },
    ]);
    const res = await POST(
      makeReq({
        originalPrompt: "p",
        followUp: "f",
        currentTracks: [{ title: "x", artist: "y" }],
        excludedArtists: ["Banned"],
      })
    );
    const data = await res.json();
    expect(data.tracks).toHaveLength(1);
    expect(data.tracks[0].uri).toBe("u2");
  });

  it("502 when Gemini parse error", async () => {
    getRefinedRecommendations.mockRejectedValue(new GeminiParseError("bad"));
    const res = await POST(
      makeReq({
        originalPrompt: "p",
        followUp: "f",
        currentTracks: [{ title: "x", artist: "y" }],
      })
    );
    expect(res.status).toBe(502);
  });

  it("503 when Gemini is temporarily unavailable", async () => {
    const err = new GeminiUnavailableError("busy");
    err.retryAfterMs = 2000;
    getRefinedRecommendations.mockRejectedValue(err);
    const res = await POST(
      makeReq({
        originalPrompt: "p",
        followUp: "f",
        currentTracks: [{ title: "x", artist: "y" }],
      })
    );
    expect(res.status).toBe(503);
    expect(res.headers.get("Retry-After")).toBe("2");
  });

  it("401 on SpotifyAuthError", async () => {
    getRefinedRecommendations.mockResolvedValue([{ title: "T", artist: "A" }]);
    searchTracks.mockRejectedValue(new SpotifyAuthError("expired"));
    const res = await POST(
      makeReq({
        originalPrompt: "p",
        followUp: "f",
        currentTracks: [{ title: "x", artist: "y" }],
      })
    );
    expect(res.status).toBe(401);
  });
});
