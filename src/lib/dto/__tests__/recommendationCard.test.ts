import { describe, it, expect } from "vitest";
import {
  recommendationCardCreateSchema,
  recommendationCardSchema,
  recommendationCardOutputSchema,
  directionEnum,
  confidenceModeEnum,
  cardStatusEnum,
} from "../recommendationCard";

describe("recommendationCardCreateSchema", () => {
  const validBase = {
    userId: "clx123abc",
    ticker: "AAPL",
    direction: "BUY" as const,
    holdDays: 5,
    confidenceScore: "balanced" as const,
    reasonLine: "Strong earnings and buyback program",
    status: "published" as const,
    validUntil: new Date("2026-06-02"),
  };

  it("parses a valid card with exact entry and target", () => {
    const result = recommendationCardCreateSchema.parse({
      ...validBase,
      entryPrice: 185.5,
      targetPrice: 210.0,
    });
    expect(result.ticker).toBe("AAPL");
    expect(result.holdDays).toBe(5);
  });

  it("parses a valid card with range entry and range target", () => {
    const result = recommendationCardCreateSchema.parse({
      ...validBase,
      entryRangeLow: 180.0,
      entryRangeHigh: 190.0,
      targetRangeLow: 200.0,
      targetRangeHigh: 220.0,
    });
    expect(result.entryRangeLow).toBe(180.0);
    expect(result.targetRangeHigh).toBe(220.0);
  });

  it("parses a card with stopPrice", () => {
    const result = recommendationCardCreateSchema.parse({
      ...validBase,
      entryPrice: 185.5,
      targetPrice: 210.0,
      stopPrice: 170.0,
    });
    expect(result.stopPrice).toBe(170.0);
  });

  it("rejects a card without any entry price", () => {
    const { success, error } = recommendationCardCreateSchema.safeParse({
      ...validBase,
      targetPrice: 210.0,
    });
    expect(success).toBe(false);
    expect(error?.issues.some((i) => i.path.includes("entryPrice"))).toBe(true);
  });

  it("rejects a card without any target price", () => {
    const { success, error } = recommendationCardCreateSchema.safeParse({
      ...validBase,
      entryPrice: 185.5,
    });
    expect(success).toBe(false);
    expect(error?.issues.some((i) => i.path.includes("targetPrice"))).toBe(true);
  });

  it("rejects an invalid direction", () => {
    const { success } = recommendationCardCreateSchema.safeParse({
      ...validBase,
      entryPrice: 185.5,
      targetPrice: 210.0,
      direction: "HOLD",
    });
    expect(success).toBe(false);
  });

  it("rejects holdDays less than 1", () => {
    const { success } = recommendationCardCreateSchema.safeParse({
      ...validBase,
      entryPrice: 185.5,
      targetPrice: 210.0,
      holdDays: 0,
    });
    expect(success).toBe(false);
  });

  it("rejects holdDays greater than 10", () => {
    const { success } = recommendationCardCreateSchema.safeParse({
      ...validBase,
      entryPrice: 185.5,
      targetPrice: 210.0,
      holdDays: 11,
    });
    expect(success).toBe(false);
  });

  it("rejects empty reasonLine", () => {
    const { success } = recommendationCardCreateSchema.safeParse({
      ...validBase,
      entryPrice: 185.5,
      targetPrice: 210.0,
      reasonLine: "",
    });
    expect(success).toBe(false);
  });

  it("rejects negative entry price", () => {
    const { success } = recommendationCardCreateSchema.safeParse({
      ...validBase,
      entryPrice: -10,
      targetPrice: 210.0,
    });
    expect(success).toBe(false);
  });

  it("rejects invalid status", () => {
    const { success } = recommendationCardCreateSchema.safeParse({
      ...validBase,
      entryPrice: 185.5,
      targetPrice: 210.0,
      status: "draft",
    });
    expect(success).toBe(false);
  });

  it("accepts no_call status without prices", () => {
    const { success } = recommendationCardCreateSchema.safeParse({
      ...validBase,
      direction: "SELL",
      status: "no_call",
      entryPrice: 185.5,
      targetPrice: 210.0,
    });
    expect(success).toBe(true);
  });
});

describe("enum schemas", () => {
  it("accepts BUY/SELL for direction", () => {
    expect(directionEnum.parse("BUY")).toBe("BUY");
    expect(directionEnum.parse("SELL")).toBe("SELL");
  });

  it("accepts all confidence modes", () => {
    for (const m of ["aggressive", "balanced", "conservative"] as const) {
      expect(confidenceModeEnum.parse(m)).toBe(m);
    }
  });

  it("accepts all card statuses", () => {
    for (const s of ["published", "no_call", "validation_failed"] as const) {
      expect(cardStatusEnum.parse(s)).toBe(s);
    }
  });
});

describe("recommendationCardOutputSchema", () => {
  it("accepts a valid output card", () => {
    const result = recommendationCardOutputSchema.safeParse({
      id: "clxoutp00000000000000001",
      ticker: "NVDA",
      direction: "BUY",
      entryPrice: 890.5,
      entryRangeLow: null,
      entryRangeHigh: null,
      targetPrice: 980.0,
      targetRangeLow: null,
      targetRangeHigh: null,
      stopPrice: 840.0,
      holdDays: 5,
      confidenceScore: "aggressive",
      reasonLine: "Strong earnings momentum continues.",
      status: "published",
      createdAt: new Date("2026-05-28"),
      validUntil: new Date("2026-06-04"),
    });
    expect(result.success).toBe(true);
  });

  it("rejects output with userId (omitted field)", () => {
    const result = recommendationCardOutputSchema.safeParse({
      id: "clxoutp00000000000000001",
      userId: "clxusr00000000000000001",
      ticker: "NVDA",
      direction: "BUY",
      entryPrice: 890.5,
      targetPrice: 980.0,
      holdDays: 5,
      confidenceScore: "aggressive",
      reasonLine: "Strong earnings momentum continues.",
      status: "published",
      createdAt: new Date("2026-05-28"),
      validUntil: new Date("2026-06-04"),
    });
    expect(result.success).toBe(false);
  });

  it("output schema has same shape minus userId", () => {
    const outputKeys = Object.keys(
      recommendationCardOutputSchema._def.shape,
    ).sort();
    const fullKeys = Object.keys(
      recommendationCardSchema._def.shape,
    ).sort();
    expect(outputKeys).toEqual(fullKeys.filter((k) => k !== "userId"));
  });
});

describe("recommendationCardSchema (full output)", () => {
  it("parses a full Prisma row", () => {
    const result = recommendationCardSchema.parse({
      id: "clx789jkl",
      userId: "clx123abc",
      ticker: "TSLA",
      direction: "SELL",
      entryPrice: null,
      entryRangeLow: 240.0,
      entryRangeHigh: 250.0,
      targetPrice: null,
      targetRangeLow: 200.0,
      targetRangeHigh: 220.0,
      stopPrice: 270.0,
      holdDays: 7,
      confidenceScore: "aggressive",
      reasonLine: "Overvaluation risk, margin pressure expected",
      status: "published",
      createdAt: new Date("2026-05-28"),
      validUntil: new Date("2026-06-04"),
    });
    expect(result.id).toBe("clx789jkl");
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.validUntil).toBeInstanceOf(Date);
  });
});
