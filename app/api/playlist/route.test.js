import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq, mockSession } from "@/__mocks__/testHelpers";

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/mongodb", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/models/User", () => ({ default: { findOne: vi.fn() } }));
vi.mock("@/models/Prompt", () => ({ default: { findOne: vi.fn() } }));
vi.mock("@/lib/spotify", () => ({
  createPlaylist: vi.fn(),
  addTracksToPlaylist: vi.fn().mockResolvedValue(undefined),
  SpotifyAuthError: class SpotifyAuthError extends Error {},
  SpotifyApiError: class SpotifyApiError extends Error {
    constructor(message, { status, spotifyMessage } = {}) {
      super(message);
      this.status = status;
      this.spotifyMessage = spotifyMessage;
    }
  },
}));
vi.mock("@/lib/spotifyAuth", () => ({
  withSpotifyRetry: vi.fn((_session, fn) => fn(_session.accessToken)),
}));
vi.mock("@/lib/playlistCover", () => ({
  uploadPlaylistCover: vi.fn().mockResolvedValue(undefined),
}));

const { getServerSession } = await import("next-auth");
const User = (await import("@/models/User")).default;
const Prompt = (await import("@/models/Prompt")).default;
const spotify = await import("@/lib/spotify");
const { POST } = await import("./route");

describe("POST /api/playlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue(mockSession());
  });

  it("401 when no session", async () => {
    getServerSession.mockResolvedValueOnce(null);
    expect((await POST(makeReq({}))).status).toBe(401);
  });

  it("404 when user not found", async () => {
    User.findOne.mockResolvedValue(null);
    expect((await POST(makeReq({ name: "x", trackUris: ["u"] }))).status).toBe(404);
  });

  it("404 when promptId not found", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    Prompt.findOne.mockResolvedValue(null);
    expect((await POST(makeReq({ promptId: "p1" }))).status).toBe(404);
  });

  it("400 when name or tracks missing", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    expect((await POST(makeReq({ name: "n" }))).status).toBe(400);
    expect((await POST(makeReq({ trackUris: ["u"] }))).status).toBe(400);
  });

  it("creates playlist, saves prompt, returns ids", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    const save = vi.fn().mockResolvedValue(undefined);
    Prompt.findOne.mockResolvedValue({
      _id: "p1",
      playlistName: "My Mix",
      recommendations: [{ uri: "spotify:track:a", albumArt: "img" }],
      save,
    });
    spotify.createPlaylist.mockResolvedValue({
      id: "pl-1",
      external_urls: { spotify: "https://open.spotify.com/playlist/pl-1" },
    });
    const res = await POST(makeReq({ promptId: "p1" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.playlistId).toBe("pl-1");
    expect(save).toHaveBeenCalled();
  });

  it("does not fail when cover upload rejects", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    Prompt.findOne.mockResolvedValue({
      _id: "p1",
      playlistName: "Mix",
      recommendations: [{ uri: "u", albumArt: "img" }],
      save: vi.fn().mockResolvedValue(undefined),
    });
    spotify.createPlaylist.mockResolvedValue({
      id: "pl-2",
      external_urls: { spotify: "url" },
    });
    const cover = (await import("@/lib/playlistCover")).uploadPlaylistCover;
    cover.mockRejectedValue(new Error("boom"));
    const res = await POST(makeReq({ promptId: "p1" }));
    expect(res.status).toBe(200);
  });

  it("401 on SpotifyAuthError", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    spotify.createPlaylist.mockRejectedValue(new spotify.SpotifyAuthError("nope"));
    const res = await POST(makeReq({ name: "n", trackUris: ["u"] }));
    expect(res.status).toBe(401);
  });

  it("403 explains missing Spotify playlist scope", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    spotify.createPlaylist.mockRejectedValue(
      new spotify.SpotifyApiError("forbidden", {
        status: 403,
        spotifyMessage: "Insufficient client scope",
      })
    );

    const res = await POST(makeReq({ name: "n", trackUris: ["u"] }));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toContain("missing playlist write permission");
  });

  it("403 explains Spotify development mode allowlist failures", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    spotify.createPlaylist.mockRejectedValue(
      new spotify.SpotifyApiError("forbidden", {
        status: 403,
        spotifyMessage: "User may not be registered",
      })
    );

    const res = await POST(makeReq({ name: "n", trackUris: ["u"] }));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toContain("Development Mode");
    expect(data.error).toContain("User Management");
  });
});
