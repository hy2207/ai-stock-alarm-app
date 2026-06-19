import { describe, expect, it } from "vitest";
import { recommendationsByRisk } from "../../mockData";
import { selectRecommendationsForRisk } from "../confidenceRecommendations";
import type { RiskProfile } from "../../types";

describe("confidence recommendation switching", () => {
  it("GWT: Given three pre-generated risk variants When risk changes Then cards switch without LLM work", () => {
    const watchlist = ["AAPL", "TSLA", "NVDA"];
    const modes: RiskProfile[] = ["conservative", "balanced", "aggressive"];

    const results = modes.map((mode) =>
      selectRecommendationsForRisk(recommendationsByRisk, mode, watchlist),
    );

    expect(results.every((cards) => cards.length <= 3)).toBe(true);
    expect(results.map((cards) => cards[0]?.confidenceScore)).toEqual(modes);
    expect(new Set(results.map((cards) => cards[0]?.actionLabel)).size).toBeGreaterThan(1);
  });

  it("GWT: Given pre-generated variants When switching 1000 times Then completes within 300ms", () => {
    const watchlist = ["AAPL", "TSLA", "NVDA"];
    const modes: RiskProfile[] = ["conservative", "balanced", "aggressive"];
    const startedAt = performance.now();

    for (let i = 0; i < 1000; i += 1) {
      selectRecommendationsForRisk(
        recommendationsByRisk,
        modes[i % modes.length],
        watchlist,
      );
    }

    expect(performance.now() - startedAt).toBeLessThan(300);
  });
});
