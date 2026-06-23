import { describe, it, expect } from "vitest";
import {
  todayRecommendationsResponseSchema,
  todayRecommendationsOkSchema,
  todayRecommendationsNoCallSchema,
} from "../todayRecommendations";

const validCard = {
  id: "clxcard00000000000000001",
  ticker: "NVDA",
  direction: "BUY" as const,
  entryPrice: 890.5,
  entryRangeLow: null,
  entryRangeHigh: null,
  targetPrice: 980.0,
  targetRangeLow: null,
  targetRangeHigh: null,
  exitPrice: 840.0,
  holdDays: 5,
  confidenceScore: "aggressive" as const,
  reasonLine: "Strong earnings momentum.",
  status: "published" as const,
  createdAt: new Date("2026-05-28"),
  validUntil: new Date("2026-06-04"),
};

describe("todayRecommendationsOkSchema", () => {
  it("accepts 1 card", () => {
    const result = todayRecommendationsOkSchema.safeParse({
      status: "ok",
      selectedRiskMode: "balanced",
      cards: [validCard],
    });
    expect(result.success).toBe(true);
  });

  it("accepts 3 cards", () => {
    const result = todayRecommendationsOkSchema.safeParse({
      status: "ok",
      selectedRiskMode: "balanced",
      cards: [validCard, validCard, validCard],
    });
    expect(result.success).toBe(true);
  });

  it("rejects 0 cards", () => {
    const result = todayRecommendationsOkSchema.safeParse({
      status: "ok",
      selectedRiskMode: "balanced",
      cards: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts 9 internal risk variants", () => {
    const result = todayRecommendationsOkSchema.safeParse({
      status: "ok",
      selectedRiskMode: "balanced",
      cards: Array.from({ length: 9 }, () => validCard),
    });
    expect(result.success).toBe(true);
  });

  it("rejects more than 9 internal risk variants", () => {
    const result = todayRecommendationsOkSchema.safeParse({
      status: "ok",
      selectedRiskMode: "balanced",
      cards: Array.from({ length: 10 }, () => validCard),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status value", () => {
    const result = todayRecommendationsOkSchema.safeParse({
      status: "ok",
      selectedRiskMode: "balanced",
      cards: "not-an-array",
    });
    expect(result.success).toBe(false);
  });
});

describe("todayRecommendationsNoCallSchema", () => {
  it("accepts valid no_call", () => {
    const result = todayRecommendationsNoCallSchema.safeParse({
      status: "no_call",
      reason: "Insufficient data for a confident recommendation today.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty reason", () => {
    const result = todayRecommendationsNoCallSchema.safeParse({
      status: "no_call",
      reason: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing reason", () => {
    const result = todayRecommendationsNoCallSchema.safeParse({
      status: "no_call",
    });
    expect(result.success).toBe(false);
  });
});

describe("todayRecommendationsResponseSchema (discriminated union)", () => {
  it("accepts ok response", () => {
    const result = todayRecommendationsResponseSchema.safeParse({
      status: "ok",
      selectedRiskMode: "balanced",
      cards: [validCard],
    });
    expect(result.success).toBe(true);
  });

  it("accepts no_call response", () => {
    const result = todayRecommendationsResponseSchema.safeParse({
      status: "no_call",
      reason: "Market conditions unclear.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown status", () => {
    const result = todayRecommendationsResponseSchema.safeParse({
      status: "error",
    });
    expect(result.success).toBe(false);
  });

  it("discriminates correctly — ok with cards, no_call with reason", () => {
    const okResult = todayRecommendationsResponseSchema.safeParse({
      status: "ok",
      selectedRiskMode: "balanced",
      cards: [validCard],
    });
    expect(okResult.success).toBe(true);

    const noCallResult = todayRecommendationsResponseSchema.safeParse({
      status: "no_call",
      reason: "test",
    });
    expect(noCallResult.success).toBe(true);
  });
});
