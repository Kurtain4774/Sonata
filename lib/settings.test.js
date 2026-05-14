import { describe, it, expect } from "vitest";
import {
  DEFAULT_SETTINGS,
  sanitizeSettingsPatch,
  mergeWithDefaults,
} from "./settings";

describe("sanitizeSettingsPatch", () => {
  it("returns {} for null or non-object", () => {
    expect(sanitizeSettingsPatch(null)).toEqual({});
    expect(sanitizeSettingsPatch("string")).toEqual({});
    expect(sanitizeSettingsPatch(42)).toEqual({});
  });

  it("keeps only known boolean keys with boolean values", () => {
    expect(
      sanitizeSettingsPatch({ allowExplicit: true, autoplayPreviews: "yes" })
    ).toEqual({ allowExplicit: true });
  });

  it("clamps defaultVolume to 0..100", () => {
    expect(sanitizeSettingsPatch({ defaultVolume: 200 }).defaultVolume).toBe(100);
    expect(sanitizeSettingsPatch({ defaultVolume: -10 }).defaultVolume).toBe(0);
    expect(sanitizeSettingsPatch({ defaultVolume: 55 }).defaultVolume).toBe(55);
  });

  it("clamps crossfadeDuration to 0..8", () => {
    expect(sanitizeSettingsPatch({ crossfadeDuration: 50 }).crossfadeDuration).toBe(8);
    expect(sanitizeSettingsPatch({ crossfadeDuration: -1 }).crossfadeDuration).toBe(0);
  });

  it("rejects non-finite numbers", () => {
    expect(sanitizeSettingsPatch({ defaultVolume: NaN })).toEqual({});
    expect(sanitizeSettingsPatch({ defaultVolume: Infinity })).toEqual({});
  });

  it("rejects invalid theme values", () => {
    expect(sanitizeSettingsPatch({ theme: "neon" })).toEqual({});
    expect(sanitizeSettingsPatch({ theme: "dark" })).toEqual({ theme: "dark" });
  });

  it("rejects invalid accentColor values", () => {
    expect(sanitizeSettingsPatch({ accentColor: "rainbow" })).toEqual({});
    expect(sanitizeSettingsPatch({ accentColor: "green" })).toEqual({ accentColor: "green" });
  });

  it("ignores unknown keys", () => {
    expect(sanitizeSettingsPatch({ hacker: "yes", allowExplicit: false })).toEqual({
      allowExplicit: false,
    });
  });
});

describe("mergeWithDefaults", () => {
  it("returns defaults when doc is null", () => {
    expect(mergeWithDefaults(null)).toEqual(DEFAULT_SETTINGS);
  });

  it("merges doc values over defaults", () => {
    const merged = mergeWithDefaults({ defaultVolume: 30, theme: "light" });
    expect(merged.defaultVolume).toBe(30);
    expect(merged.theme).toBe("light");
    expect(merged.accentColor).toBe(DEFAULT_SETTINGS.accentColor);
  });

  it("skips null/undefined doc values", () => {
    const merged = mergeWithDefaults({ defaultVolume: null, theme: undefined });
    expect(merged.defaultVolume).toBe(DEFAULT_SETTINGS.defaultVolume);
    expect(merged.theme).toBe(DEFAULT_SETTINGS.theme);
  });
});
