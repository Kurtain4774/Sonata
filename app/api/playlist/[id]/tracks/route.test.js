import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq, mockSession } from "@/__mocks__/testHelpers";

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/mongodb", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/models/User", () => ({ default: { findOne: vi.fn() } }));
vi.mock("@/models/Prompt", () => ({ default: { findOne: vi.fn() } }));
vi.mock("@/lib/spotify", () => ({
  addTracksToPlaylist: vi.fn().mockResolvedValue(undefined),
  removeTracksFromPlaylist: vi.fn().mockResolvedValue(undefined),
  replacePlaylistTracks: vi.fn().mockResolvedValue(undefined),
  SpotifyAuthError: class SpotifyAuthError extends Error {},
}));

const { getServerSession } = await import("next-auth");
const User = (await import("@/models/User")).default;
const Prompt = (await import("@/models/Prompt")).default;
const spotify = await import("@/lib/spotify");
const { PATCH } = await import("./route");

const paramsCtx = { params: Promise.resolve({ id: "p1" }) };

function makeDoc(overrides = {}) {
  return {
    recommendations: [
      { uri: "u1", title: "T1" },
      { uri: "u2", title: "T2" },
    ],
    refinementHistory: [],
    savedAsPlaylist: false,
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("PATCH /api/playlist/[id]/tracks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue(mockSession());
    User.findOne.mockResolvedValue({ _id: "uid" });
  });

  it("replaceAll overwrites recommendations", async () => {
    const doc = makeDoc();
    Prompt.findOne.mockResolvedValue(doc);
    const res = await PATCH(
      makeReq({ replaceAll: [{ uri: "uX" }] }),
      paramsCtx
    );
    expect(res.status).toBe(200);
    expect(doc.recommendations).toEqual([{ uri: "uX" }]);
  });

  it("removeUris filters them out", async () => {
    const doc = makeDoc();
    Prompt.findOne.mockResolvedValue(doc);
    await PATCH(makeReq({ removeUris: ["u1"] }), paramsCtx);
    expect(doc.recommendations.map((t) => t.uri)).toEqual(["u2"]);
  });

  it("replaceMap substitutes by URI", async () => {
    const doc = makeDoc();
    Prompt.findOne.mockResolvedValue(doc);
    await PATCH(
      makeReq({ replaceMap: { u1: { uri: "uNew", title: "New" } } }),
      paramsCtx
    );
    expect(doc.recommendations[0].uri).toBe("uNew");
  });

  it("appendTracks dedupes existing URIs", async () => {
    const doc = makeDoc();
    Prompt.findOne.mockResolvedValue(doc);
    await PATCH(
      makeReq({ appendTracks: [{ uri: "u1" }, { uri: "u3" }] }),
      paramsCtx
    );
    expect(doc.recommendations.map((t) => t.uri)).toEqual(["u1", "u2", "u3"]);
  });

  it("pushes refinement history entry", async () => {
    const doc = makeDoc();
    Prompt.findOne.mockResolvedValue(doc);
    await PATCH(
      makeReq({
        removeUris: ["u1"],
        refinement: { followUp: "more chill", shortcutsApplied: ["x"] },
      }),
      paramsCtx
    );
    expect(doc.refinementHistory).toHaveLength(1);
    expect(doc.refinementHistory[0].followUp).toBe("more chill");
  });

  it("syncs to Spotify only when savedAsPlaylist", async () => {
    const doc = makeDoc({ savedAsPlaylist: false });
    Prompt.findOne.mockResolvedValue(doc);
    await PATCH(makeReq({ removeUris: ["u1"] }), paramsCtx);
    expect(spotify.removeTracksFromPlaylist).not.toHaveBeenCalled();
  });

  it("calls replacePlaylistTracks for replaceAll when saved", async () => {
    const doc = makeDoc({ savedAsPlaylist: true, spotifyPlaylistId: "pl" });
    Prompt.findOne.mockResolvedValue(doc);
    await PATCH(makeReq({ replaceAll: [{ uri: "uX" }] }), paramsCtx);
    expect(spotify.replacePlaylistTracks).toHaveBeenCalledWith(
      expect.any(String),
      "pl",
      ["uX"]
    );
  });
});
