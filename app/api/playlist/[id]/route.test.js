import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq, mockSession } from "@/__mocks__/testHelpers";

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/mongodb", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/models/User", () => ({ default: { findOne: vi.fn() } }));
vi.mock("@/models/Prompt", () => ({
  default: { findOne: vi.fn(), deleteOne: vi.fn() },
}));
vi.mock("@/lib/spotify", () => ({
  updatePlaylistDetails: vi.fn(),
  SpotifyAuthError: class SpotifyAuthError extends Error {},
}));

const { getServerSession } = await import("next-auth");
const User = (await import("@/models/User")).default;
const Prompt = (await import("@/models/Prompt")).default;
const { updatePlaylistDetails } = await import("@/lib/spotify");
const { PATCH, DELETE } = await import("./route");

const paramsCtx = { params: Promise.resolve({ id: "p1" }) };

describe("PATCH /api/playlist/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue(mockSession());
  });

  it("401 with no session", async () => {
    getServerSession.mockResolvedValueOnce(null);
    expect((await PATCH(makeReq({}), paramsCtx)).status).toBe(401);
  });

  it("404 when user missing", async () => {
    User.findOne.mockResolvedValue(null);
    expect((await PATCH(makeReq({}), paramsCtx)).status).toBe(404);
  });

  it("404 when prompt missing", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    Prompt.findOne.mockResolvedValue(null);
    expect((await PATCH(makeReq({}), paramsCtx)).status).toBe(404);
  });

  it("truncates playlistName to 120 chars", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    const doc = {
      playlistName: "",
      save: vi.fn().mockResolvedValue(undefined),
      savedAsPlaylist: false,
    };
    Prompt.findOne.mockResolvedValue(doc);
    await PATCH(makeReq({ playlistName: "x".repeat(200) }), paramsCtx);
    expect(doc.playlistName.length).toBe(120);
  });

  it("does not call Spotify when savedAsPlaylist is false", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    Prompt.findOne.mockResolvedValue({
      savedAsPlaylist: false,
      spotifyPlaylistId: "pl",
      save: vi.fn().mockResolvedValue(undefined),
    });
    await PATCH(makeReq({ playlistName: "n" }), paramsCtx);
    expect(updatePlaylistDetails).not.toHaveBeenCalled();
  });

  it("calls Spotify when saved + name/desc change, swallows sync errors", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    Prompt.findOne.mockResolvedValue({
      savedAsPlaylist: true,
      spotifyPlaylistId: "pl-1",
      save: vi.fn().mockResolvedValue(undefined),
    });
    updatePlaylistDetails.mockRejectedValue(new Error("sync fail"));
    const res = await PATCH(makeReq({ playlistName: "new" }), paramsCtx);
    expect(updatePlaylistDetails).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/playlist/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue(mockSession());
  });

  it("401 with no session", async () => {
    getServerSession.mockResolvedValueOnce(null);
    expect((await DELETE(makeReq(undefined, { method: "DELETE" }), paramsCtx)).status).toBe(401);
  });

  it("404 when deletedCount=0", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    Prompt.deleteOne.mockResolvedValue({ deletedCount: 0 });
    const res = await DELETE(makeReq(undefined, { method: "DELETE" }), paramsCtx);
    expect(res.status).toBe(404);
  });

  it("200 when delete succeeds", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    Prompt.deleteOne.mockResolvedValue({ deletedCount: 1 });
    const res = await DELETE(makeReq(undefined, { method: "DELETE" }), paramsCtx);
    expect(res.status).toBe(200);
  });
});
