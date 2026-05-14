import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq, mockSession } from "@/__mocks__/testHelpers";

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/mongodb", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/models/User", () => ({ default: { findOne: vi.fn() } }));
vi.mock("@/models/Prompt", () => {
  const find = vi.fn().mockReturnValue({
    sort: () => ({ limit: () => ({ lean: () => Promise.resolve([]) }) }),
  });
  return { default: { find, create: vi.fn().mockResolvedValue({ _id: { toString: () => "pid-1" } }) } };
});
vi.mock("@/models/Settings", () => ({
  default: { findOne: vi.fn().mockReturnValue({ lean: () => Promise.resolve(null) }) },
}));
vi.mock("@/lib/gemini", () => ({
  getRecommendations: vi.fn(),
  GeminiParseError: class GeminiParseError extends Error {},
  GeminiUnavailableError: class GeminiUnavailableError extends Error {},
}));
vi.mock("@/lib/spotify", () => ({
  searchTrack: vi.fn(),
  getTopArtists: vi.fn().mockResolvedValue([]),
  getTopTracks: vi.fn().mockResolvedValue([]),
  getRecentlyPlayed: vi.fn().mockResolvedValue([]),
  SpotifyAuthError: class SpotifyAuthError extends Error {},
}));
vi.mock("@/lib/spotifyAuth", () => ({
  withSpotifyRetry: vi.fn((session, fn) => fn(session.accessToken)),
}));
vi.mock("@/lib/deezer", () => ({ getDeezerPreview: vi.fn().mockResolvedValue(null) }));

const { getServerSession } = await import("next-auth");
const { getRecommendations } = await import("@/lib/gemini");
const { searchTrack } = await import("@/lib/spotify");
const { POST } = await import("./route");

async function readStream(res) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const lines = [];
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n");
    buf = parts.pop();
    for (const p of parts) if (p.trim()) lines.push(JSON.parse(p));
  }
  if (buf.trim()) lines.push(JSON.parse(buf));
  return lines;
}

describe("POST /api/recommend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue(mockSession({ spotifyId: `rec-${Math.random()}` }));
  });

  it("401 when no session", async () => {
    getServerSession.mockResolvedValueOnce(null);
    expect((await POST(makeReq({ prompt: "a" }))).status).toBe(401);
  });

  it("400 when prompt missing", async () => {
    expect((await POST(makeReq({}))).status).toBe(400);
  });

  it("400 when prompt > 500 chars", async () => {
    expect((await POST(makeReq({ prompt: "x".repeat(501) }))).status).toBe(400);
  });

  it("preserves the streaming frame contract on success", async () => {
    getRecommendations.mockResolvedValue([{ title: "T", artist: "A" }]);
    searchTrack.mockResolvedValue({
      title: "T",
      artist: "A",
      uri: "spotify:track:1",
      explicit: false,
    });
    const res = await POST(makeReq({ prompt: "chill vibes" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/x-ndjson; charset=utf-8");

    const lines = await readStream(res);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toEqual({
      type: "meta",
      playlistName: "Chill Vibes Mix",
      prompt: "chill vibes",
      total: 1,
    });
    expect(lines[1]).toEqual({
      type: "track",
      track: {
        title: "T",
        artist: "A",
        uri: "spotify:track:1",
        explicit: false,
        previewUrl: null,
      },
    });
    expect(lines[2]).toEqual({
      type: "done",
      promptId: null,
    });
  });

  it("deduplicates tracks with the same URI", async () => {
    getRecommendations.mockResolvedValue([
      { title: "T", artist: "A" },
      { title: "T2", artist: "A" },
    ]);
    searchTrack.mockResolvedValue({
      title: "T",
      artist: "A",
      uri: "spotify:track:dup",
      explicit: false,
    });
    const res = await POST(makeReq({ prompt: "p" }));
    const lines = await readStream(res);
    const tracks = lines.filter((l) => l.type === "track");
    expect(tracks).toHaveLength(1);
  });

  it("filters excluded artists from matched results", async () => {
    getRecommendations.mockResolvedValue([
      { title: "T1", artist: "A" },
      { title: "T2", artist: "B" },
    ]);
    searchTrack.mockImplementation(async (_t, _title, artist) => ({
      title: _title,
      artist,
      uri: `spotify:track:${_title}`,
      explicit: false,
    }));
    const res = await POST(
      makeReq({ prompt: "p", excludedArtists: ["A"] })
    );
    const lines = await readStream(res);
    const tracks = lines.filter((l) => l.type === "track");
    expect(tracks).toHaveLength(1);
    expect(tracks[0].track.artist).toBe("B");
  });

  it("emits error frame when Gemini parse fails", async () => {
    const { GeminiParseError } = await import("@/lib/gemini");
    getRecommendations.mockRejectedValue(new GeminiParseError("bad"));
    const res = await POST(makeReq({ prompt: "p" }));
    const lines = await readStream(res);
    const err = lines.find((l) => l.type === "error");
    expect(err).toEqual({
      type: "error",
      status: 502,
      message: "The AI returned an unreadable response. Try again.",
    });
  });
});
