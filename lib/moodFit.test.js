import { describe, it, expect } from "vitest";
import { moodFitFromScore, moodFitColor, moodFitBars } from "./moodFit";

describe("moodFitFromScore", () => {
  it("returns null for null/NaN", () => {
    expect(moodFitFromScore(null)).toBeNull();
    expect(moodFitFromScore(undefined)).toBeNull();
    expect(moodFitFromScore(NaN)).toBeNull();
  });

  it("maps boundary scores correctly", () => {
    expect(moodFitFromScore(100)).toBe("Perfect");
    expect(moodFitFromScore(95)).toBe("Perfect");
    expect(moodFitFromScore(94)).toBe("Excellent");
    expect(moodFitFromScore(90)).toBe("Excellent");
    expect(moodFitFromScore(89)).toBe("Great");
    expect(moodFitFromScore(85)).toBe("Great");
    expect(moodFitFromScore(84)).toBe("Good");
    expect(moodFitFromScore(75)).toBe("Good");
    expect(moodFitFromScore(74)).toBe("Fair");
    expect(moodFitFromScore(0)).toBe("Fair");
  });
});

describe("moodFitColor", () => {
  it("returns tailwind class set for each known label", () => {
    for (const label of ["Perfect", "Excellent", "Great", "Good", "Fair"]) {
      const c = moodFitColor(label);
      expect(c).toHaveProperty("text");
      expect(c).toHaveProperty("bg");
      expect(c).toHaveProperty("bar");
    }
  });

  it("returns neutral fallback for unknown labels", () => {
    expect(moodFitColor("Other").text).toMatch(/neutral/);
    expect(moodFitColor(null).text).toMatch(/neutral/);
  });
});

describe("moodFitBars", () => {
  it("maps labels to bar counts", () => {
    expect(moodFitBars("Perfect")).toBe(4);
    expect(moodFitBars("Excellent")).toBe(4);
    expect(moodFitBars("Great")).toBe(3);
    expect(moodFitBars("Good")).toBe(2);
    expect(moodFitBars("Fair")).toBe(1);
  });

  it("returns 0 for unknown labels", () => {
    expect(moodFitBars("Unknown")).toBe(0);
    expect(moodFitBars(null)).toBe(0);
  });
});
