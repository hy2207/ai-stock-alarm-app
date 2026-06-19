import { describe, expect, it, vi } from "vitest";
import { persistRecommendationGeneration } from "../persistRecommendationGeneration";
import type { RecommendationGeneration } from "../generateRecommendationCards";

const mockCreate = vi.hoisted(() => vi.fn());
const mockTransaction = vi.hoisted(() => vi.fn((operations) => Promise.all(operations)));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mockTransaction,
    recommendationCard: {
      create: mockCreate,
    },
  },
}));

const generation = {
  status: "ok",
  variants: [
    {
      ticker: "AAPL",
      direction: "BUY",
      entryPrice: 190,
      targetPrice: 205,
      stopPrice: 184,
      holdDays: 3,
      confidenceMode: "aggressive",
      reasonLine: "Strong demand and volume support a short swing setup.",
    },
    {
      ticker: "AAPL",
      direction: "BUY",
      entryPrice: 188,
      targetPrice: 201,
      stopPrice: 183,
      holdDays: 4,
      confidenceMode: "balanced",
      reasonLine: "Balanced entry keeps downside controlled while trend holds.",
    },
    {
      ticker: "AAPL",
      direction: "BUY",
      entryPrice: 185,
      targetPrice: 197,
      stopPrice: 180,
      holdDays: 5,
      confidenceMode: "conservative",
      reasonLine: "Wait for a lower entry while the broader setup remains intact.",
    },
  ],
} satisfies RecommendationGeneration;

describe("persistRecommendationGeneration", () => {
  it("GWT: Given three variants When persisting Then creates published cards with evidence snapshots", async () => {
    mockCreate.mockImplementation(({ data }) => Promise.resolve({ id: data.confidenceScore, ...data }));

    const result = await persistRecommendationGeneration({
      userId: "clxuser000000000000000001",
      generation,
      evidence: {
        newsSignalScore: 72,
        volumeSignalScore: 64,
        communitySignalScore: 50,
        patternTag: "swing",
      },
      now: new Date("2026-06-19T00:00:00.000Z"),
    });

    expect(result).toHaveLength(3);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledTimes(3);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "published",
          confidenceScore: "aggressive",
          validUntil: new Date("2026-06-22T00:00:00.000Z"),
          evidenceSnapshots: {
            create: {
              newsSignalScore: 72,
              volumeSignalScore: 64,
              communitySignalScore: 50,
              patternTag: "swing",
            },
          },
        }),
      }),
    );
  });

  it("GWT: Given No Call generation When persisting Then leaves Prisma untouched", async () => {
    mockCreate.mockClear();
    mockTransaction.mockClear();

    const result = await persistRecommendationGeneration({
      userId: "clxuser000000000000000001",
      generation: {
        status: "no_call",
        reason: "Insufficient evidence.",
      },
    });

    expect(result).toEqual([]);
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
