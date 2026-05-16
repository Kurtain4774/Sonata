import { describe, it, expect } from "vitest";
import {
  SURPRISE_PROMPTS,
  EXAMPLE_PROMPTS,
  pickRotating,
  randomSurprisePrompt,
  getContextualSuggestion,
} from "./promptIdeas";

// Build a Date for a given weekday (0=Sun) and hour.
function dateFor(day, hour) {
  // 2024-01-07 is a Sunday; add `day` days to land on the target weekday.
  const d = new Date(2024, 0, 7 + day, hour, 0, 0);
  return d;
}

describe("pickRotating", () => {
  it("returns the requested count", () => {
    expect(pickRotating(EXAMPLE_PROMPTS, 4, 0)).toHaveLength(4);
  });

  it("never returns more than the list length", () => {
    expect(pickRotating(["a", "b"], 5, 0)).toHaveLength(2);
  });

  it("is deterministic for a fixed seed", () => {
    expect(pickRotating(EXAMPLE_PROMPTS, 3, 123456)).toEqual(
      pickRotating(EXAMPLE_PROMPTS, 3, 123456)
    );
  });

  it("handles an empty list", () => {
    expect(pickRotating([], 3, 0)).toEqual([]);
  });
});

describe("randomSurprisePrompt", () => {
  it("returns an entry from the pool", () => {
    expect(SURPRISE_PROMPTS).toContain(randomSurprisePrompt(() => 0));
    expect(SURPRISE_PROMPTS).toContain(randomSurprisePrompt(() => 0.999));
  });
});

describe("getContextualSuggestion", () => {
  it("suggests a wind-down late at night", () => {
    expect(getContextualSuggestion(dateFor(3, 0)).label).toBe(
      "Late-night wind-down"
    );
  });

  it("suggests going out on a Friday evening", () => {
    expect(getContextualSuggestion(dateFor(5, 21)).label).toBe("Going out");
  });

  it("suggests going out on a Saturday evening", () => {
    expect(getContextualSuggestion(dateFor(6, 20)).label).toBe("Going out");
  });

  it("suggests a commute on a weekday morning", () => {
    expect(getContextualSuggestion(dateFor(2, 8)).label).toBe(
      "Morning commute"
    );
  });

  it("suggests a focus session midday on a weekday", () => {
    expect(getContextualSuggestion(dateFor(3, 13)).label).toBe(
      "Focus session"
    );
  });

  it("suggests easygoing on a weekend afternoon", () => {
    expect(getContextualSuggestion(dateFor(0, 14)).label).toBe(
      "Easygoing weekend"
    );
  });

  it("falls back to an evening unwind", () => {
    expect(getContextualSuggestion(dateFor(2, 19)).label).toBe(
      "Evening unwind"
    );
  });

  it("always returns a non-empty prompt and blurb", () => {
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const s = getContextualSuggestion(dateFor(day, hour));
        expect(s.prompt.length).toBeGreaterThan(0);
        expect(s.blurb.length).toBeGreaterThan(0);
        expect(s.label.length).toBeGreaterThan(0);
      }
    }
  });
});
