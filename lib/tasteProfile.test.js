import { describe, it, expect } from "vitest";
import { deriveTasteTags, topGenresFromArtists } from "./tasteProfile";

describe("deriveTasteTags", () => {
  it("returns default tags for empty input", () => {
    expect(deriveTasteTags([])).toEqual([
      "Melodic",
      "Chill",
      "Atmospheric",
      "Upbeat",
      "Nostalgic",
    ]);
  });

  it("matches keywords to tags", () => {
    const tags = deriveTasteTags(["hip hop", "trap", "boom bap"]);
    expect(tags[0]).toBe("Lyrical");
  });

  it("pads to 5 tags with fallback defaults", () => {
    const tags = deriveTasteTags(["metal"]);
    expect(tags).toHaveLength(5);
    expect(tags[0]).toBe("Heavy");
  });

  it("never returns duplicates", () => {
    const tags = deriveTasteTags(["pop", "dance", "edm"]);
    expect(new Set(tags).size).toBe(tags.length);
  });
});

describe("topGenresFromArtists", () => {
  it("returns empty for no genres", () => {
    expect(topGenresFromArtists([])).toEqual([]);
    expect(topGenresFromArtists([{ genres: [] }])).toEqual([]);
  });

  it("returns top 5 by frequency, title-cased", () => {
    const artists = [
      { genres: ["indie pop", "indie pop", "rock"] },
      { genres: ["indie pop", "rock"] },
      { genres: ["jazz"] },
    ];
    const top = topGenresFromArtists(artists);
    expect(top[0].name).toBe("Indie Pop");
    expect(top[0].percent).toBeGreaterThan(top[1].percent);
  });

  it("limits output to 5", () => {
    const artists = [
      { genres: ["a", "b", "c", "d", "e", "f", "g"] },
    ];
    expect(topGenresFromArtists(artists).length).toBeLessThanOrEqual(5);
  });
});
