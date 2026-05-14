import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeReq, mockSession } from "@/__mocks__/testHelpers";

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));

const { getServerSession } = await import("next-auth");
const {
  jsonError,
  jsonOk,
  rateLimitResponse,
  readJsonBody,
  requireApiSession,
  spotifySessionExpiredResponse,
} = await import("./api");

describe("api helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue(mockSession());
  });

  it("returns a stable JSON error response", async () => {
    const res = jsonError("Nope", 418);
    expect(res.status).toBe(418);
    expect(await res.json()).toEqual({ error: "Nope" });
  });

  it("returns a stable JSON success response", async () => {
    const res = jsonOk({ ok: true });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("requires an authenticated session", async () => {
    getServerSession.mockResolvedValueOnce(null);
    const { session, response } = await requireApiSession();
    expect(session).toBeNull();
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Not authenticated" });
  });

  it("treats refresh-token failures as unauthenticated", async () => {
    getServerSession.mockResolvedValueOnce(mockSession({ error: "RefreshAccessTokenError" }));
    const { response } = await requireApiSession();
    expect(response.status).toBe(401);
  });

  it("can preserve legacy routes that only require a session object", async () => {
    const legacySession = mockSession({ error: "RefreshAccessTokenError" });
    getServerSession.mockResolvedValueOnce(legacySession);
    const { session, response } = await requireApiSession({ rejectRefreshError: false });
    expect(session).toBe(legacySession);
    expect(response).toBeNull();
  });

  it("can require an access token with a custom message", async () => {
    getServerSession.mockResolvedValueOnce(mockSession({ accessToken: null }));
    const { response } = await requireApiSession({
      requireAccessToken: true,
      unauthorizedMessage: "Unauthorized",
    });
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("reads JSON bodies and maps parse failures", async () => {
    const good = await readJsonBody(makeReq({ ok: true }));
    expect(good.body).toEqual({ ok: true });
    expect(good.response).toBeNull();

    const bad = await readJsonBody(makeReq("garbage"));
    expect(bad.body).toBeNull();
    expect(bad.response.status).toBe(400);
    expect(await bad.response.json()).toEqual({ error: "Invalid JSON" });
  });

  it("formats rate-limit responses with Retry-After", async () => {
    const res = rateLimitResponse({ retryAfterMs: 1200 });
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("2");
    expect(await res.json()).toEqual({ error: "Slow down — try again in 2s." });
  });

  it("formats Spotify session expiry responses", async () => {
    const res = spotifySessionExpiredResponse();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: "Spotify session expired — please log in again.",
    });
  });
});
