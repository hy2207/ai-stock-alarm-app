import { describe, it, expect } from "vitest";
import { recommendationDetailSchema } from "../recommendationDetail";

const validCard = {
  id: "clxcard00000000000000001",
  ticker: "AAPL",
  direction: "BUY",
  entryPrice: 185.5,
  entryRangeLow: null,
  entryRangeHigh: null,
  targetPrice: 210.0,
  targetRangeLow: null,
  targetRangeHigh: null,
  exitPrice: 170.0,
  holdDays: 5,
  confidenceScore: "balanced",
  reasonLine: "Strong earnings momentum",
  status: "published",
  createdAt: new Date("2026-05-28"),
  validUntil: new Date("2026-06-04"),
};

const validEvidence = {
  id: "clxevd00000000000000001",
  recId: "clxcard00000000000000001",
  newsSignalScore: 75.0,
  volumeSignalScore: 60.0,
  communitySignalScore: 80.0,
  patternTag: "breakout",
  createdAt: new Date("2026-05-28"),
};

describe("recommendationDetailSchema", () => {
  it("parses a valid detail response with evidence and performance", () => {
    const result = recommendationDetailSchema.parse({
      card: validCard,
      evidence: validEvidence,
      performance: [
        {
          id: "clxperf0000000000000001",
          recId: "clxcard00000000000000001",
          ticker: "AAPL",
          predictedDirection: "BUY",
          realizedReturn: 12.5,
          hitFlag: true,
          evaluationWindowDays: 5,
          evaluatedAt: new Date("2026-06-04"),
          createdAt: new Date("2026-05-28"),
        },
      ],
    });
    expect(result.card.ticker).toBe("AAPL");
    expect(result.evidence?.newsSignalScore).toBe(75);
    expect(result.performance).toHaveLength(1);
    expect(result.performance[0].hitFlag).toBe(true);
  });

  it("parses detail response with null evidence", () => {
    const result = recommendationDetailSchema.parse({
      card: validCard,
      evidence: null,
      performance: [],
    });
    expect(result.evidence).toBeNull();
    expect(result.performance).toHaveLength(0);
  });

  it("parses detail response with multiple performance records", () => {
    const result = recommendationDetailSchema.parse({
      card: validCard,
      evidence: null,
      performance: [
        {
          id: "clxperf0000000000000001",
          recId: "clxcard00000000000000001",
          ticker: "AAPL",
          predictedDirection: "BUY",
          realizedReturn: 12.5,
          hitFlag: true,
          evaluationWindowDays: 5,
          evaluatedAt: new Date("2026-06-04"),
          createdAt: new Date("2026-05-28"),
        },
        {
          id: "clxperf0000000000000002",
          recId: "clxcard00000000000000001",
          ticker: "AAPL",
          predictedDirection: "SELL",
          realizedReturn: -8.2,
          hitFlag: false,
          evaluationWindowDays: 5,
          evaluatedAt: new Date("2026-05-20"),
          createdAt: new Date("2026-05-14"),
        },
      ],
    });
    expect(result.performance).toHaveLength(2);
    expect(result.performance[1].hitFlag).toBe(false);
  });

  it("rejects missing card field", () => {
    const { success } = recommendationDetailSchema.safeParse({
      evidence: null,
      performance: [],
    });
    expect(success).toBe(false);
  });

  it("rejects invalid card data", () => {
    const { success } = recommendationDetailSchema.safeParse({
      card: { ...validCard, direction: "HOLD" },
      evidence: null,
      performance: [],
    });
    expect(success).toBe(false);
  });

  it("rejects invalid evidence data", () => {
    const { success } = recommendationDetailSchema.safeParse({
      card: validCard,
      evidence: { id: "clxevd1", recId: "clxcard1" },
      performance: [],
    });
    expect(success).toBe(false);
  });
});
