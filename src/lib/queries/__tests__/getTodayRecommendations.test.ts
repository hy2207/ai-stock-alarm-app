import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockGetCurrentUserId = vi.fn();
const mockFindMany = vi.fn();

vi.mock("@/lib/auth/getServerSession", () => ({
  getCurrentUserId: mockGetCurrentUserId,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    recommendationCard: {
      findMany: mockFindMany,
    },
  },
}));

// Pin a stable "now" so today‑boundary helpers in the module resolve
// to a known frame.  The module calls `new Date()` at import time for
// default exports, but getTodayRecommendations is a function, so each
// call creates fresh Date objects.  We freeze Date so every call sees
// the same "now".
const NOW = new Date("2026-05-30T10:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("getTodayRecommendations", () => {
  it("returns no_call when user is not authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const { getTodayRecommendations } = await import("../getTodayRecommendations");
    const result = await getTodayRecommendations();

    expect(result).toEqual({
      status: "no_call",
      reason: "Sign in to see your daily recommendations",
    });
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("returns no_call when no published cards exist for today", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([]);

    const { getTodayRecommendations } = await import("../getTodayRecommendations");
    const result = await getTodayRecommendations();

    expect(result).toEqual({
      status: "no_call",
      reason: "No recommendations available today. Check back tomorrow morning.",
    });
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        status: "published",
        createdAt: {
          gte: new Date("2026-05-30T00:00:00.000Z"),
          lt: new Date("2026-05-31T00:00:00.000Z"),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  });

  it("returns ok with cards when published cards exist for today", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([
      {
        id: "clh123abcxyz0001",
        ticker: "NVDA",
        direction: "BUY",
        entryPrice: 880.5,
        entryRangeLow: null,
        entryRangeHigh: null,
        targetPrice: 960.0,
        targetRangeLow: null,
        targetRangeHigh: null,
        stopPrice: null,
        holdDays: 5,
        confidenceScore: "aggressive",
        reasonLine: "AI data-center demand continues to accelerate",
        status: "published",
        createdAt: new Date("2026-05-30T08:00:00.000Z"),
        validUntil: new Date("2026-06-04T00:00:00.000Z"),
      },
    ]);

    const { getTodayRecommendations } = await import("../getTodayRecommendations");
    const result = await getTodayRecommendations();

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.cards).toHaveLength(1);
      expect(result.cards[0]).toMatchObject({
        ticker: "NVDA",
        direction: "BUY",
        entryPrice: 880.5,
        reasonLine: "AI data-center demand continues to accelerate",
      });
      expect((result.cards[0] as Record<string, unknown>).userId).toBeUndefined();
    }
  });

  it("returns at most 3 cards ordered by createdAt desc", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue(
      Array.from({ length: 3 }, (_, i) => ({
        id: `clh456xyz00${String(i).padStart(3, "0")}`,
        ticker: "AAPL",
        direction: "BUY" as const,
        entryPrice: 180 + i,
        entryRangeLow: null,
        entryRangeHigh: null,
        targetPrice: 200 + i,
        targetRangeLow: null,
        targetRangeHigh: null,
        stopPrice: null,
        holdDays: 5,
        confidenceScore: "aggressive" as const,
        reasonLine: "Test card",
        status: "published" as const,
        createdAt: new Date(`2026-05-30T0${9 - i}:00:00.000Z`),
        validUntil: new Date("2026-06-04T00:00:00.000Z"),
      })),
    );

    const { getTodayRecommendations } = await import("../getTodayRecommendations");
    const result = await getTodayRecommendations();

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.cards).toHaveLength(3);
      expect(
        new Date(result.cards[0].createdAt).getTime()
      ).toBeGreaterThanOrEqual(
        new Date(result.cards[2].createdAt).getTime()
      );
    }
  });
});
