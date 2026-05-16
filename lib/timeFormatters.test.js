import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatDuration,
  relativeTime,
  shortRelativeTime,
  dayHeader,
  formatDate,
  formatDateTime,
} from "./timeFormatters";

describe("formatDuration", () => {
  it("formats milliseconds as m:ss", () => {
    expect(formatDuration(65000)).toBe("1:05");
    expect(formatDuration(3661000)).toBe("61:01");
  });

  it("floors partial seconds", () => {
    expect(formatDuration(90999)).toBe("1:30");
  });

  it("returns the empty label for falsy input", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(null, "—")).toBe("—");
    expect(formatDuration(undefined, "")).toBe("");
  });
});

describe("relative time helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-15T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("relativeTime returns verbose phrases", () => {
    expect(relativeTime(new Date("2026-05-15T11:59:30Z"))).toBe("Just now");
    expect(relativeTime(new Date("2026-05-15T11:55:00Z"))).toBe("5 minutes ago");
    expect(relativeTime(new Date("2026-05-15T10:00:00Z"))).toBe("2 hours ago");
    expect(relativeTime(new Date("2026-05-14T12:00:00Z"))).toBe("Yesterday");
    expect(relativeTime("")).toBe("");
  });

  it("shortRelativeTime returns compact phrases", () => {
    expect(shortRelativeTime(new Date("2026-05-15T11:55:00Z"))).toBe("5m ago");
    expect(shortRelativeTime(new Date("2026-05-15T10:00:00Z"))).toBe("2h ago");
    expect(shortRelativeTime(new Date("2026-05-14T12:00:00Z"))).toBe("Yesterday");
    expect(shortRelativeTime("")).toBe("");
  });

  it("dayHeader buckets by calendar day", () => {
    expect(dayHeader(new Date("2026-05-15T08:00:00Z"))).toBe("Today");
    expect(dayHeader(new Date("2026-05-14T08:00:00Z"))).toBe("Yesterday");
  });
});

describe("calendar formatters", () => {
  it("formatDate and formatDateTime return non-empty strings", () => {
    const iso = "2026-05-15T15:07:00Z";
    expect(formatDate(iso)).toMatch(/2026/);
    expect(formatDateTime(iso)).toMatch(/2026/);
  });
});
