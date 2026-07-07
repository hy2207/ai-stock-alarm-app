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

  it("rejects a card missing point prices", () => {
    const { success } = recommendationCardCreateSchema.safeParse({
      ...validBase,
    });
    expect(success).toBe(false);
  });

  it("parses a card with exitPrice", () => {
    const result = recommendationCardCreateSchema.parse({
      ...validBase,
      entryPrice: 185.5,
      targetPrice: 210.0,
      exitPrice: 170.0,
    });
    expect(result.exitPrice).toBe(170.0);
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

  it("rejects whitespace-only reasonLine", () => {
    const { success } = recommendationCardCreateSchema.safeParse({
      ...validBase,
      entryPrice: 185.5,
      targetPrice: 210.0,
      reasonLine: "   ",
    });
    expect(success).toBe(false);
  });

  it("rejects reasonLine exceeding 160 characters", () => {
    const { success } = recommendationCardCreateSchema.safeParse({
      ...validBase,
      entryPrice: 185.5,
      targetPrice: 210.0,
      reasonLine: "x".repeat(161),
    });
    expect(success).toBe(false);
  });

  it("accepts reasonLine exactly 160 characters (boundary)", () => {
    const { success } = recommendationCardCreateSchema.safeParse({
      ...validBase,
      entryPrice: 185.5,
      targetPrice: 210.0,
      reasonLine: "x".repeat(160),
    });
    expect(success).toBe(true);
  });

  it("accepts reasonLine exactly 1 character (boundary)", () => {
    const { success } = recommendationCardCreateSchema.safeParse({
      ...validBase,
      entryPrice: 185.5,
      targetPrice: 210.0,
      reasonLine: "X",
    });
    expect(success).toBe(true);
  });

  it("published cards always have 1-160 char reasonLine (output schema)", () => {
    const published = recommendationCardCreateSchema.safeParse({
      ...validBase,
      entryPrice: 185.5,
      targetPrice: 210.0,
      reasonLine: "Published card with valid reason line.",
      status: "published",
    });
    expect(published.success).toBe(true);
    if (published.success) {
      expect(published.data.reasonLine.length).toBeGreaterThanOrEqual(1);
      expect(published.data.reasonLine.length).toBeLessThanOrEqual(160);
    }
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

  it("accepts entryPrice alone without any range fields", () => {
    const { success } = recommendationCardCreateSchema.safeParse({
      ...validBase,
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
      targetPrice: 980.0,
      exitPrice: 840.0,
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
      targetPrice: null,
      exitPrice: 270.0,
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
