import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockSession } from "@/__mocks__/testHelpers";

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/mongodb", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/models/User", () => ({ default: { findOne: vi.fn() } }));
vi.mock("@/models/Prompt", () => ({
  default: { find: vi.fn(), deleteMany: vi.fn() },
}));

const { getServerSession } = await import("next-auth");
const User = (await import("@/models/User")).default;
const Prompt = (await import("@/models/Prompt")).default;
const { GET, DELETE } = await import("./route");

describe("GET /api/history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue(mockSession());
  });

  it("401 with no session", async () => {
    getServerSession.mockResolvedValueOnce(null);
    expect((await GET()).status).toBe(401);
  });

  it("returns empty prompts when user missing (not 404)", async () => {
    User.findOne.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(200);
    expect((await res.json()).prompts).toEqual([]);
  });

  it("maps prompt projection and limits thumbnails to first 5 (falsy filtered)", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    Prompt.find.mockReturnValue({
      sort: () => ({
        limit: () => ({
          lean: () =>
            Promise.resolve([
              {
                _id: { toString: () => "p1" },
                promptText: "chill",
                playlistName: "Mix",
                recommendations: [
                  { albumArt: "img1" },
                  { albumArt: null },
                  { albumArt: "img2" },
                  { albumArt: "img3" },
                  { albumArt: "img4" },
                  { albumArt: "img5" },
                  { albumArt: "img6" },
                ],
                savedAsPlaylist: true,
                spotifyPlaylistUrl: "url",
                createdAt: new Date(),
              },
            ]),
        }),
      }),
    });
    const res = await GET();
    const data = await res.json();
    expect(data.prompts[0].id).toBe("p1");
    expect(data.prompts[0].trackCount).toBe(7);
    expect(data.prompts[0].thumbnails).toEqual(["img1", "img2", "img3", "img4"]);
  });
});

describe("DELETE /api/history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue(mockSession());
  });

  it("returns 0 when user missing", async () => {
    User.findOne.mockResolvedValue(null);
    const res = await DELETE();
    expect((await res.json()).deleted).toBe(0);
  });

  it("returns deletedCount on success", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    Prompt.deleteMany.mockResolvedValue({ deletedCount: 7 });
    const res = await DELETE();
    expect((await res.json()).deleted).toBe(7);
  });
});
