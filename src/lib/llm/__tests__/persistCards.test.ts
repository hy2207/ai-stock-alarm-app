import { describe, it, expect, vi, beforeEach } from "vitest";
import { persistCards } from "../persistCards";
import type { LlmVariantCard } from "@/lib/dto/llmOutput";

const mockCreateMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    recommendationCard: {
      createMany: mockCreateMany,
    },
  },
}));

const baseVariants: LlmVariantCard[] = [
  {
    ticker: "AAPL",
    direction: "BUY",
    entryPrice: 190,
    entryRangeLow: null,
    entryRangeHigh: null,
    targetPrice: 210,
    targetRangeLow: null,
    targetRangeHigh: null,
    stopPrice: null,
    holdDays: 5,
    reasonLine: "Strong earnings momentum",
    confidenceMode: "aggressive",
  },
  {
    ticker: "AAPL",
    direction: "BUY",
    entryPrice: null,
    entryRangeLow: 188,
    entryRangeHigh: 192,
    targetPrice: null,
    targetRangeLow: 200,
    targetRangeHigh: 210,
    stopPrice: 180,
    holdDays: 7,
    reasonLine: "Stable growth outlook",
    confidenceMode: "balanced",
  },
  {
    ticker: "AAPL",
    direction: "BUY",
    entryPrice: 188,
    entryRangeLow: null,
    entryRangeHigh: null,
    targetPrice: 200,
    targetRangeLow: null,
    targetRangeHigh: null,
    stopPrice: null,
    holdDays: 10,
    reasonLine: "Cautious entry on dips",
    confidenceMode: "conservative",
  },
];

beforeEach(() => {
  mockCreateMany.mockClear();
});

describe("persistCards", () => {
  it("saves 3 validated card variants", async () => {
    mockCreateMany.mockResolvedValue({ count: 3 });

    const result = await persistCards({
      userId: "clx1234567890abcdef",
      variants: baseVariants,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.count).toBe(3);
    }
    expect(mockCreateMany).toHaveBeenCalledTimes(1);
  });

  it("returns error when all variants fail validation", async () => {
    const invalidVariants: LlmVariantCard[] = [
      {
        ticker: "TSLA",
        direction: "BUY",
        entryPrice: null,
        entryRangeLow: null,
        entryRangeHigh: null,
        targetPrice: 250,
        targetRangeLow: null,
        targetRangeHigh: null,
        stopPrice: null,
        holdDays: 5,
        reasonLine: "Test",
        confidenceMode: "balanced",
      },
    ];

    const result = await persistCards({
      userId: "clx1234567890abcdef",
      variants: invalidVariants,
    });

    expect(result.ok).toBe(false);
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("saves only valid variants when some are invalid", async () => {
    mockCreateMany.mockResolvedValue({ count: 2 });

    const mixedVariants: LlmVariantCard[] = [
      ...baseVariants.slice(0, 2),
      {
        ticker: "INVALID",
        direction: "BUY",
        entryPrice: null,
        entryRangeLow: null,
        entryRangeHigh: null,
        targetPrice: null,
        targetRangeLow: null,
        targetRangeHigh: null,
        stopPrice: null,
        holdDays: 0,
        reasonLine: "",
        confidenceMode: "balanced",
      },
    ];

    const result = await persistCards({
      userId: "clx1234567890abcdef",
      variants: mixedVariants,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.count).toBe(2);
    }
    expect(mockCreateMany).toHaveBeenCalledTimes(1);
  });

  it("returns error on Prisma failure", async () => {
    mockCreateMany.mockRejectedValue(new Error("DB connection lost"));

    const result = await persistCards({
      userId: "clx1234567890abcdef",
      variants: baseVariants,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("DB connection lost");
    }
  });

  it("validates entry price must exist when range is not provided", async () => {
    const noEntryVariants: LlmVariantCard[] = [
      {
        ticker: "AAPL",
        direction: "BUY",
        entryPrice: null,
        entryRangeLow: null,
        entryRangeHigh: null,
        targetPrice: 210,
        targetRangeLow: null,
        targetRangeHigh: null,
        stopPrice: null,
        holdDays: 5,
        reasonLine: "Test",
        confidenceMode: "balanced",
      },
    ];

    const result = await persistCards({
      userId: "clx1234567890abcdef",
      variants: noEntryVariants,
    });

    expect(result.ok).toBe(false);
    expect(mockCreateMany).not.toHaveBeenCalled();
  });
});
