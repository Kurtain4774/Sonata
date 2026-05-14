import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

describe("rateLimit", () => {
  let rateLimit;

  beforeEach(async () => {
    vi.resetModules();
    ({ rateLimit } = await import("./rateLimit"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns ok:true for null/empty key", () => {
    expect(rateLimit(null).ok).toBe(true);
    expect(rateLimit("").ok).toBe(true);
  });

  it("allows up to the limit", () => {
    for (let i = 0; i < 3; i++) {
      expect(rateLimit("user-a", { limit: 3 }).ok).toBe(true);
    }
  });

  it("blocks the call that exceeds the limit", () => {
    for (let i = 0; i < 3; i++) rateLimit("user-b", { limit: 3 });
    const res = rateLimit("user-b", { limit: 3 });
    expect(res.ok).toBe(false);
    expect(res.remaining).toBe(0);
    expect(res.retryAfterMs).toBeGreaterThan(0);
  });

  it("isolates keys", () => {
    for (let i = 0; i < 3; i++) rateLimit("user-c", { limit: 3 });
    expect(rateLimit("user-d", { limit: 3 }).ok).toBe(true);
  });

  it("expires hits after the window passes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    for (let i = 0; i < 3; i++) rateLimit("user-e", { limit: 3, windowMs: 1000 });
    expect(rateLimit("user-e", { limit: 3, windowMs: 1000 }).ok).toBe(false);
    vi.setSystemTime(new Date("2026-01-01T00:00:02Z"));
    expect(rateLimit("user-e", { limit: 3, windowMs: 1000 }).ok).toBe(true);
  });
});
