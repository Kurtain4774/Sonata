// Shared smoke test covering common behavior across the stats + playback routes,
// which are thin pass-throughs to Spotify: 401 on no session, 401 on auth error,
// 500 on generic throw.
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/spotify", () => ({
  getTopArtists: vi.fn(),
  getTopTracks: vi.fn(),
  getRecentlyPlayed: vi.fn(),
  getCurrentPlayback: vi.fn(),
  togglePlayback: vi.fn(),
  skipToNext: vi.fn(),
  skipToPrevious: vi.fn(),
  setVolume: vi.fn(),
  seekPlayback: vi.fn(),
  getQueue: vi.fn(),
  SpotifyAuthError: class SpotifyAuthError extends Error {},
}));

const { getServerSession } = await import("next-auth");
const spotify = await import("@/lib/spotify");
const { mockSession } = await import("@/__mocks__/testHelpers");

function makeGetReq(url = "http://localhost/api/x") {
  return new Request(url, { method: "GET" });
}
function makePutReq(body = {}) {
  return new Request("http://localhost/api/x", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const routes = [
  {
    name: "GET /api/stats/top-artists",
    path: "@/app/api/stats/top-artists/route",
    method: "GET",
    spotifyFn: "getTopArtists",
    invoke: (mod) => mod.GET(makeGetReq("http://localhost/api/stats/top-artists")),
  },
  {
    name: "GET /api/now-playing",
    path: "@/app/api/now-playing/route",
    method: "GET",
    spotifyFn: "getCurrentPlayback",
    invoke: (mod) => mod.GET(),
  },
  {
    name: "PUT /api/playback/play",
    path: "@/app/api/playback/play/route",
    method: "PUT",
    spotifyFn: "togglePlayback",
    invoke: (mod) => mod.PUT(makePutReq({ play: true })),
  },
];

for (const route of routes) {
  describe(route.name, () => {
    let mod;
    beforeEach(async () => {
      vi.clearAllMocks();
      mod = await import(route.path);
      // Default: succeed unless overridden.
      spotify[route.spotifyFn].mockResolvedValue(
        route.spotifyFn === "togglePlayback" ? { ok: true } : []
      );
    });

    it("401 when no session", async () => {
      getServerSession.mockResolvedValue(null);
      const res = await route.invoke(mod);
      expect(res.status).toBe(401);
    });

    it("401 on RefreshAccessTokenError", async () => {
      getServerSession.mockResolvedValue(
        mockSession({ error: "RefreshAccessTokenError" })
      );
      const res = await route.invoke(mod);
      expect(res.status).toBe(401);
    });

    it("401 on SpotifyAuthError thrown by spotify lib", async () => {
      getServerSession.mockResolvedValue(mockSession());
      spotify[route.spotifyFn].mockRejectedValue(
        new spotify.SpotifyAuthError("expired")
      );
      const res = await route.invoke(mod);
      expect(res.status).toBe(401);
    });

    it("500 on generic error", async () => {
      getServerSession.mockResolvedValue(mockSession());
      spotify[route.spotifyFn].mockRejectedValue(new Error("boom"));
      const res = await route.invoke(mod);
      expect(res.status).toBe(500);
    });
  });
}
