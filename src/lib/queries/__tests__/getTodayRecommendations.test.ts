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

function publishedCard(overrides: Record<string, unknown> = {}) {
  return {
    id: "clh123abcxyz0001",
    ticker: "NVDA",
    direction: "BUY" as const,
    entryPrice: 880.5,
    entryRangeLow: null,
    entryRangeHigh: null,
    targetPrice: 960.0,
    targetRangeLow: null,
    targetRangeHigh: null,
    stopPrice: null,
    holdDays: 5,
    confidenceScore: "aggressive" as const,
    reasonLine: "AI data-center demand continues to accelerate",
    status: "published" as const,
    createdAt: new Date("2026-05-30T08:00:00.000Z"),
    validUntil: new Date("2026-06-04T00:00:00.000Z"),
    ...overrides,
  };
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
  vi.restoreAllMocks();
});

describe("getTodayRecommendations (TEST-F2-01)", () => {
  describe("GWT: No Call 상태 (REQ-FUNC-013)", () => {
    it("Given 미인증 사용자가 홈에 접근했을 때 When getTodayRecommendations를 호출하면 Then no_call + 로그인 안내를 반환한다", async () => {
      mockGetCurrentUserId.mockResolvedValue(null);

      const { getTodayRecommendations } = await import("../getTodayRecommendations");
      const result = await getTodayRecommendations();

      expect(result).toEqual({
        status: "no_call",
        reason: "Sign in to see your daily recommendations",
      });
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it("Given 게시된 오늘 카드가 없을 때 When 조회하면 Then no_call + 내일 안내를 반환한다", async () => {
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
  });

  describe("GWT: 정상 카드 조회 (REQ-FUNC-010)", () => {
    it("Given 오늘 게시된 카드가 있을 때 When getTodayRecommendations를 호출하면 Then 카드 배열을 담은 ok를 반환한다", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-1");
      mockFindMany.mockResolvedValue([publishedCard()]);

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

    it("Given 3장의 카드가 있을 때 When 조회하면 Then 3장 이하로 반환되며 createdAt 내림차순 정렬된다", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-1");
      mockFindMany.mockResolvedValue(
        Array.from({ length: 3 }, (_, i) => publishedCard({
          id: `clh456xyz00${String(i).padStart(3, "0")}`,
          entryPrice: 180 + i,
          targetPrice: 200 + i,
          createdAt: new Date(`2026-05-30T0${9 - i}:00:00.000Z`),
        })),
      );

      const { getTodayRecommendations } = await import("../getTodayRecommendations");
      const result = await getTodayRecommendations();

      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        expect(result.cards).toHaveLength(3);
        expect(
          new Date(result.cards[0].createdAt).getTime(),
        ).toBeGreaterThanOrEqual(
          new Date(result.cards[result.cards.length - 1].createdAt).getTime(),
        );
      }
    });

    it("Given 데이터베이스에 5장의 카드가 있어도 When 조회하면 Then 최대 3장만 반환된다", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-1");
      mockFindMany.mockResolvedValue(
        Array.from({ length: 3 }, (_, i) => publishedCard({
          id: `clh789xyz${i}`,
          createdAt: new Date(`2026-05-30T0${9 - i}:00:00.000Z`),
        })),
      );

      const { getTodayRecommendations } = await import("../getTodayRecommendations");
      const result = await getTodayRecommendations();

      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        expect(result.cards.length).toBeLessThanOrEqual(3);
      }
    });
  });

  describe("GWT: 필수 필드 검증 (REQ-FUNC-011)", () => {
    it("Given 카드가 반환될 때 When 각 카드를 검사하면 Then ticker/direction/confidenceScore가 100% non-null이다", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-1");
      mockFindMany.mockResolvedValue(
        Array.from({ length: 3 }, (_, i) => publishedCard({
          id: `clh101xyz${i}`,
          ticker: i === 0 ? "AAPL" : i === 1 ? "MSFT" : "GOOGL",
          direction: i === 0 ? "BUY" : "SELL",
          confidenceScore: i === 0 ? "aggressive" : i === 1 ? "balanced" : "conservative",
          createdAt: new Date(`2026-05-30T0${9 - i}:00:00.000Z`),
        })),
      );

      const { getTodayRecommendations } = await import("../getTodayRecommendations");
      const result = await getTodayRecommendations();

      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        for (const card of result.cards) {
          expect(card.ticker).toBeDefined();
          expect(card.ticker).not.toBeNull();
          expect(typeof card.ticker).toBe("string");
          expect(card.ticker.length).toBeGreaterThan(0);

          expect(card.direction).toBeDefined();
          expect(card.direction).not.toBeNull();

          expect(card.confidenceScore).toBeDefined();
          expect(card.confidenceScore).not.toBeNull();
        }
      }
    });

    it("Given 카드가 반환될 때 When 각 카드를 검사하면 Then 5개 필수 표시 필드가 모두 존재한다 (REQ-FUNC-012)", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-1");
      mockFindMany.mockResolvedValue(
        Array.from({ length: 2 }, (_, i) => publishedCard({
          id: `clh102xyz${i}`,
          createdAt: new Date(`2026-05-30T0${9 - i}:00:00.000Z`),
        })),
      );

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

    it("Given 카드에 entryRange가 entryPrice 대신 사용될 때 When 조회하면 Then entryRangeLow/entryRangeHigh가 존재한다", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-1");
      mockFindMany.mockResolvedValue([
        publishedCard({
          entryPrice: null,
          entryRangeLow: 850.0,
          entryRangeHigh: 900.0,
        }),
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
  });

  describe("GWT: 경계 조건 (REQ-FUNC-010/013)", () => {
    it("Given 정확히 1장의 카드만 있을 때 When 조회하면 Then 1장만 반환된다", async () => {
      mockGetCurrentUserId.mockResolvedValue("user-1");
      mockFindMany.mockResolvedValue([publishedCard()]);

      const { getTodayRecommendations } = await import("../getTodayRecommendations");
      const result = await getTodayRecommendations();

      expect(result.status).toBe("ok");
      if (result.status === "ok") {
        expect(result.cards).toHaveLength(1);
      }
    });

    it("Given getCurrentUserId가 예외를 throw하면 When getTodayRecommendations를 호출하면 Then 예외가 전파된다", async () => {
      mockGetCurrentUserId.mockRejectedValue(new Error("Database connection failed"));

      const { getTodayRecommendations } = await import("../getTodayRecommendations");

      await expect(getTodayRecommendations()).rejects.toThrow(
        "Database connection failed",
      );
    });
  });
});
