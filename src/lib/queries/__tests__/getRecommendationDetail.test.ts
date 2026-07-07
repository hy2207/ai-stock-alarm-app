import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockGetCurrentUserId = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("@/lib/auth/getServerSession", () => ({
  getCurrentUserId: mockGetCurrentUserId,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    recommendationCard: {
      findFirst: mockFindFirst,
    },
  },
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-30T10:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const validCard = {
  id: "clh789recq02001",
  userId: "user-1",
  ticker: "NVDA",
  direction: "BUY",
  entryPrice: 880.5,
  entryRangeLow: null,
  entryRangeHigh: null,
  targetPrice: 960.0,
  targetRangeLow: null,
  targetRangeHigh: null,
  exitPrice: null,
  holdDays: 5,
  confidenceScore: "aggressive",
  reasonLine: "AI demand continues to accelerate",
  status: "published",
  createdAt: new Date("2026-05-30T08:00:00.000Z"),
  validUntil: new Date("2026-06-04T00:00:00.000Z"),
  performanceRecords: [
    {
      id: "clh789perf00001",
      recId: "clh789recq02001",
      ticker: "NVDA",
      predictedDirection: "BUY",
      realizedReturn: null,
      hitFlag: null,
      evaluationWindowDays: 5,
      evaluatedAt: null,
      createdAt: new Date("2026-05-30T08:00:00.000Z"),
    },
  ],
};

describe("getRecommendationDetail", () => {
  it("returns undefined when user is not authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const { getRecommendationDetail } = await import("../getRecommendationDetail");
    const result = await getRecommendationDetail("rec-1");

    expect(result).toBeUndefined();
  });

  it("returns undefined when card not found", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindFirst.mockResolvedValue(null);

    const { getRecommendationDetail } = await import("../getRecommendationDetail");
    const result = await getRecommendationDetail("nonexistent");

    expect(result).toBeUndefined();
  });

  it("returns detail with card and performance", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindFirst.mockResolvedValue(validCard);

    const { getRecommendationDetail } = await import("../getRecommendationDetail");
    const result = await getRecommendationDetail("clh789recq02001");

    expect(result).toBeDefined();
    expect(result!.card.ticker).toBe("NVDA");
    expect(result!.card.direction).toBe("BUY");
    expect(result!.performance).toHaveLength(1);
    expect((result!.card as Record<string, unknown>).userId).toBeUndefined();
  });


  it("filters by both recId and userId", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindFirst.mockResolvedValue(null);

    await (await import("../getRecommendationDetail")).getRecommendationDetail("rec-xyz");

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { id: "rec-xyz", userId: "user-1" },
      include: {
        performanceRecords: { orderBy: { createdAt: "desc" } },
      },
    });
  });
});
