import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockGetCurrentUserId = vi.fn();
const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();

vi.mock("@/lib/auth/getServerSession", () => ({
  getCurrentUserId: mockGetCurrentUserId,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    riskProfile: {
      findUnique: mockFindUnique,
    },
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

function publishedCard(overrides: Record<string, unknown> = {}) {
  return {
    id: "clh123abcxyz0001",
    ticker: "NVDA",
    direction: "BUY" as const,
    entryPrice: 880.5,
    currentPrice: 900.0,
    entryRangeLow: null,
    entryRangeHigh: null,
    targetPrice: 960.0,
    targetRangeLow: null,
    targetRangeHigh: null,
    exitPrice: 970.0,
    holdDays: 5,
    confidenceScore: "aggressive" as const,
    reasonLine: "AI data-center demand continues to accelerate",
    status: "published" as const,
    createdAt: new Date("2026-05-30T08:00:00.000Z"),
    validUntil: new Date("2026-06-04T00:00:00.000Z"),
    ...overrides,
  };
}

function validBuySet(ticker = "NVDA") {
  return [
    publishedCard({
      id: "cvalidaggressive001",
      ticker,
      confidenceScore: "aggressive",
      exitPrice: 970,
    }),
    publishedCard({
      id: "cvalidbalanced00001",
      ticker,
      confidenceScore: "balanced",
      exitPrice: 955,
    }),
    publishedCard({
      id: "cvalidconserv00001",
      ticker,
      confidenceScore: "conservative",
      exitPrice: 930,
    }),
  ];
}

function validSellSet(ticker = "TSLA") {
  return [
    publishedCard({
      id: "cvalidsellaggr001",
      ticker,
      direction: "SELL",
      currentPrice: 300,
      targetPrice: 250,
      confidenceScore: "aggressive",
      exitPrice: 330,
    }),
    publishedCard({
      id: "cvalidsellbal0001",
      ticker,
      direction: "SELL",
      currentPrice: 300,
      targetPrice: 250,
      confidenceScore: "balanced",
      exitPrice: 315,
    }),
    publishedCard({
      id: "cvalidsellcons001",
      ticker,
      direction: "SELL",
      currentPrice: 300,
      targetPrice: 250,
      confidenceScore: "conservative",
      exitPrice: 305,
    }),
  ];
}

const requiredDisplayFields = [
  "direction",
  "entryPrice",
  "holdDays",
  "confidenceScore",
  "reasonLine",
] as const;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

beforeEach(() => {
  mockFindUnique.mockResolvedValue({ riskMode: "balanced" });
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
    expect(mockFindUnique).not.toHaveBeenCalled();
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
      take: 9,
    });
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { userId: "user-1" } });
  });

  it("returns ok with cards when published cards exist for today", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue(validBuySet());

    const { getTodayRecommendations } = await import("../getTodayRecommendations");
    const result = await getTodayRecommendations();

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.selectedRiskMode).toBe("balanced");
      expect(result.cards).toHaveLength(3);
      expect(result.cards[0]).toMatchObject({
        ticker: "NVDA",
        direction: "BUY",
        entryPrice: 880.5,
        reasonLine: "AI data-center demand continues to accelerate",
      });
      expect((result.cards[0] as Record<string, unknown>).userId).toBeUndefined();
    }
  });

  it("returns the saved risk profile so the home UI can select the matching variant", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindUnique.mockResolvedValue({ riskMode: "conservative" });
    mockFindMany.mockResolvedValue(validBuySet());

    const { getTodayRecommendations } = await import("../getTodayRecommendations");
    const result = await getTodayRecommendations();

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.selectedRiskMode).toBe("conservative");
      expect(result.cards.some((card) => card.confidenceScore === "conservative")).toBe(true);
    }
  });

  it("falls back to balanced when the user has no saved risk profile", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindUnique.mockResolvedValue(null);
    mockFindMany.mockResolvedValue(validBuySet());

    const { getTodayRecommendations } = await import("../getTodayRecommendations");
    const result = await getTodayRecommendations();

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.selectedRiskMode).toBe("balanced");
    }
  });

  it("returns at most 3 cards ordered by createdAt desc", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue(validBuySet("AAPL"));

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

  it("returns cards with ticker, direction, and confidenceScore present", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue(validBuySet("AAPL"));

    const { getTodayRecommendations } = await import("../getTodayRecommendations");
    const result = await getTodayRecommendations();

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      for (const card of result.cards) {
        expect(card.ticker).toBeDefined();
        expect(card.ticker).not.toBeNull();
        expect(card.ticker.length).toBeGreaterThan(0);
        expect(card.direction).toBeDefined();
        expect(card.direction).not.toBeNull();
        expect(card.confidenceScore).toBeDefined();
        expect(card.confidenceScore).not.toBeNull();
      }
    }
  });

  it("returns cards with required display fields for card UI", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue(validBuySet());

    const { getTodayRecommendations } = await import("../getTodayRecommendations");
    const result = await getTodayRecommendations();

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      for (const card of result.cards) {
        for (const field of requiredDisplayFields) {
          expect(card).toHaveProperty(field);
          expect((card as Record<string, unknown>)[field]).toBeDefined();
        }
      }
    }
  });

  it("returns entry range fields when a card uses range instead of single entry price", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([
      ...validBuySet().map((card) =>
        publishedCard({
          ...card,
          entryPrice: null,
          entryRangeLow: 850.0,
          entryRangeHigh: 900.0,
        }),
      ),
    ]);

    const { getTodayRecommendations } = await import("../getTodayRecommendations");
    const result = await getTodayRecommendations();

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      const card = result.cards[0];
      expect(card.entryPrice).toBeNull();
      expect(card.entryRangeLow).toBe(850.0);
      expect(card.entryRangeHigh).toBe(900.0);
    }
  });

  it("serves today's cards as-is even when risk-mode set is incomplete (no forced regeneration)", async () => {
    // Regression: requiring a full 3-mode set caused the home page to
    // regenerate cards on every visit after non-balanced cards were removed.
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([
      publishedCard({ confidenceScore: "balanced", exitPrice: 930 }),
    ]);

    const { getTodayRecommendations } = await import("../getTodayRecommendations");
    const result = await getTodayRecommendations();

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].confidenceScore).toBe("balanced");
    }
  });

  it("returns SELL cards when aggressive sell price is highest", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue(validSellSet());

    const { getTodayRecommendations } = await import("../getTodayRecommendations");
    const result = await getTodayRecommendations();

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.cards).toHaveLength(3);
      expect(result.cards.find((card) => card.confidenceScore === "aggressive"))
        .toMatchObject({ direction: "SELL", exitPrice: 330 });
    }
  });

  it("propagates getCurrentUserId errors to the caller", async () => {
    mockGetCurrentUserId.mockRejectedValue(new Error("Database connection failed"));

    const { getTodayRecommendations } = await import("../getTodayRecommendations");

    await expect(getTodayRecommendations()).rejects.toThrow(
      "Database connection failed",
    );
  });
});
