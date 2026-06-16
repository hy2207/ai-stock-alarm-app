import type { RecommendationCardCreateInput } from "../dto/recommendationCard";
import { MOCK_USER_ID } from "./user";

const now = new Date("2026-05-28T09:00:00Z");
const validUntil = new Date("2026-06-02T09:00:00Z");

export const mockAggressiveCard: RecommendationCardCreateInput = {
  userId: MOCK_USER_ID,
  ticker: "NVDA",
  direction: "BUY",
  entryPrice: 890.5,
  targetPrice: 980.0,
  stopPrice: 840.0,
  holdDays: 5,
  confidenceScore: "aggressive",
  reasonLine:
    "Data center revenue guidance +18% QoQ, Blackwell shipments accelerating ahead of schedule. Short-term pullback offers entry.",
  status: "published",
  validUntil,
};

export const mockBalancedCard: RecommendationCardCreateInput = {
  userId: MOCK_USER_ID,
  ticker: "AAPL",
  direction: "BUY",
  entryRangeLow: 182.0,
  entryRangeHigh: 186.0,
  targetRangeLow: 195.0,
  targetRangeHigh: 200.0,
  stopPrice: 175.0,
  holdDays: 7,
  confidenceScore: "balanced",
  reasonLine:
    "Services revenue at all-time high offsetting iPhone cycle softness. Wait for dip to $182-186 range for risk-adjusted entry.",
  status: "published",
  validUntil,
};

export const mockConservativeCard: RecommendationCardCreateInput = {
  userId: MOCK_USER_ID,
  ticker: "MSFT",
  direction: "BUY",
  entryPrice: 415.0,
  targetPrice: 445.0,
  stopPrice: 400.0,
  holdDays: 10,
  confidenceScore: "conservative",
  reasonLine:
    "Azure growth re-accelerating with AI workload migration. Strong balance sheet supports steady upside with limited downside risk.",
  status: "published",
  validUntil,
};

export const mockCardsByConfidence: Record<string, RecommendationCardCreateInput> = {
  aggressive: mockAggressiveCard,
  balanced: mockBalancedCard,
  conservative: mockConservativeCard,
};

export const mockNoCallCard: RecommendationCardCreateInput = {
  userId: MOCK_USER_ID,
  ticker: "TSLA",
  direction: "BUY",
  entryPrice: 175.0,
  targetPrice: 175.0,
  holdDays: 1,
  confidenceScore: "balanced",
  reasonLine:
    "Waiting for more data due to low signal confidence.",
  status: "no_call",
  validUntil,
};
