import { describe, it, expect } from "vitest";
import { similarityRatio, trackMatchScore } from "./stringSimilarity";

describe("similarityRatio", () => {
  it("returns 1 for identical strings", () => {
    expect(similarityRatio("Hello", "Hello")).toBe(1);
  });

  it("returns 1 when both empty/null", () => {
    expect(similarityRatio("", "")).toBe(1);
    expect(similarityRatio(null, null)).toBe(1);
  });

  it("is case insensitive", () => {
    expect(similarityRatio("Hello World", "hello world")).toBe(1);
  });

  it("strips parenthetical and bracket annotations", () => {
    expect(similarityRatio("Song (Remix)", "Song")).toBe(1);
    expect(similarityRatio("Song [Live]", "Song")).toBe(1);
  });

  it("strips feat./ft./featuring suffixes", () => {
    expect(similarityRatio("Song feat. Other", "Song")).toBe(1);
    expect(similarityRatio("Song ft. X", "Song")).toBe(1);
    expect(similarityRatio("Song featuring Someone", "Song")).toBe(1);
  });

  it("ignores punctuation differences", () => {
    expect(similarityRatio("Don't Stop", "dont stop")).toBe(1);
  });

  it("returns less than 1 for different strings", () => {
    expect(similarityRatio("hello", "world")).toBeLessThan(0.5);
  });
});

describe("trackMatchScore", () => {
  it("returns 100 for perfect match", () => {
    expect(trackMatchScore("Song", "Artist", "Song", "Artist")).toBe(100);
  });

  it("weights title (55%) more than artist (45%)", () => {
    // Same title, different artist
    const titleOnly = trackMatchScore("Song", "Artist", "Song", "XXXXXX");
    // Same artist, different title
    const artistOnly = trackMatchScore("Song", "Artist", "XXXX", "Artist");
    expect(titleOnly).toBeGreaterThan(artistOnly);
  });

  it("returns 0..100 range", () => {
    const s = trackMatchScore("a", "b", "z", "y");
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
  });

  it("treats remix annotation as same song", () => {
    expect(trackMatchScore("Song (Remix)", "Artist", "Song", "Artist")).toBe(100);
  });
});
