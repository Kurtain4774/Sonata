import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq, mockSession } from "@/__mocks__/testHelpers";
import { DEFAULT_SETTINGS } from "@/lib/settings";

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/mongodb", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/models/User", () => ({ default: { findOne: vi.fn() } }));
vi.mock("@/models/Settings", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

const { getServerSession } = await import("next-auth");
const User = (await import("@/models/User")).default;
const Settings = (await import("@/models/Settings")).default;
const { GET, PUT } = await import("./route");

describe("GET /api/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue(mockSession());
  });

  it("401 with no session", async () => {
    getServerSession.mockResolvedValueOnce(null);
    expect((await GET()).status).toBe(401);
  });

  it("returns DEFAULT_SETTINGS when user missing", async () => {
    User.findOne.mockResolvedValue(null);
    const res = await GET();
    const data = await res.json();
    expect(data.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("creates settings doc when none exists", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    Settings.findOne.mockReturnValue({ lean: () => Promise.resolve(null) });
    Settings.create.mockResolvedValue({
      toObject: () => ({ defaultVolume: 50 }),
    });
    const res = await GET();
    const data = await res.json();
    expect(Settings.create).toHaveBeenCalledWith({ userId: "uid" });
    expect(data.settings.defaultVolume).toBe(50);
  });

  it("merges existing doc with defaults", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    Settings.findOne.mockReturnValue({
      lean: () => Promise.resolve({ defaultVolume: 22, theme: "light" }),
    });
    const data = await (await GET()).json();
    expect(data.settings.defaultVolume).toBe(22);
    expect(data.settings.theme).toBe("light");
    expect(data.settings.accentColor).toBe(DEFAULT_SETTINGS.accentColor);
  });
});

describe("PUT /api/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue(mockSession());
  });

  it("401 with no session", async () => {
    getServerSession.mockResolvedValueOnce(null);
    expect((await PUT(makeReq({}))).status).toBe(401);
  });

  it("400 on invalid JSON", async () => {
    expect((await PUT(makeReq("garbage"))).status).toBe(400);
  });

  it("404 when user missing", async () => {
    User.findOne.mockResolvedValue(null);
    expect((await PUT(makeReq({ defaultVolume: 50 }))).status).toBe(404);
  });

  it("upserts with sanitized patch", async () => {
    User.findOne.mockResolvedValue({ _id: "uid" });
    Settings.findOneAndUpdate.mockReturnValue({
      lean: () => Promise.resolve({ defaultVolume: 50, theme: "dark" }),
    });
    const res = await PUT(
      makeReq({ defaultVolume: 50, hacker: "yes", theme: "neon" })
    );
    expect(res.status).toBe(200);
    const args = Settings.findOneAndUpdate.mock.calls[0];
    expect(args[1].$set).toEqual({ defaultVolume: 50 });
    expect(args[2].upsert).toBe(true);
  });
});
