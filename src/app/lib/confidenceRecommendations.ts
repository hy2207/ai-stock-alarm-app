import type { RecommendationCard, RiskProfile } from "../types";

export function selectRecommendationsForRisk(
  recommendationsByRisk: Record<RiskProfile, RecommendationCard[]>,
  riskMode: RiskProfile,
  watchlist: string[],
  limit = 3,
): RecommendationCard[] {
  const watchlistSet = new Set(watchlist);
  return recommendationsByRisk[riskMode]
    .filter((rec) => watchlistSet.has(rec.ticker))
    .slice(0, limit);
}
