import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeEvaluationFromOhlcv } from "../evaluatePerformance";
import type { StoredPricePoint } from "@/lib/market-data/storePriceHistory";

// ── helpers ──────────────────────────────────────────────────────────────────

function candle(
  date: string,
  open: number,
  high: number,
  low: number,
  close: number,
): StoredPricePoint {
  return { date, open, high, low, close, volume: null };
}

// ── Pure unit tests for computeEvaluationFromOhlcv ───────────────────────────

describe("computeEvaluationFromOhlcv", () => {
  describe("BUY — target reached", () => {
    it("hits when a candle high touches targetPrice", () => {
      const candles = [
        candle("2026-07-01", 100, 105, 99, 103),
        candle("2026-07-02", 103, 112, 102, 110), // high 112 >= target 110
        candle("2026-07-03", 110, 113, 108, 111),
      ];
      const { hitFlag, realizedReturn } = computeEvaluationFromOhlcv("BUY", 100, 110, candles);
      expect(hitFlag).toBe(true);
      expect(realizedReturn).toBeCloseTo(10, 1);
    });

    it("return is locked at targetPrice, not close", () => {
      const candles = [candle("2026-07-01", 100, 115, 99, 108)]; // high 115 >= target 110
      const { realizedReturn } = computeEvaluationFromOhlcv("BUY", 100, 110, candles);
      expect(realizedReturn).toBeCloseTo(10, 1); // (110-100)/100, not (108-100)/100
    });

    it("misses when no candle high reaches target", () => {
      const candles = [
        candle("2026-07-01", 100, 104, 99, 103),
        candle("2026-07-02", 103, 106, 102, 104),
      ];
      const { hitFlag, realizedReturn } = computeEvaluationFromOhlcv("BUY", 100, 110, candles);
      expect(hitFlag).toBe(false);
      expect(realizedReturn).toBeCloseTo(4, 1); // (104-100)/100
    });

    it("miss with negative return when price fell over hold window", () => {
      const candles = [
        candle("2026-07-01", 100, 101, 88, 90),
        candle("2026-07-02", 90, 92, 85, 87),
      ];
      const { hitFlag, realizedReturn } = computeEvaluationFromOhlcv("BUY", 100, 110, candles);
      expect(hitFlag).toBe(false);
      expect(realizedReturn).toBeCloseTo(-13, 1);
    });

    it("no targetPrice: hitFlag follows sign of return", () => {
      const up = [candle("2026-07-01", 100, 108, 99, 106)];
      expect(computeEvaluationFromOhlcv("BUY", 100, null, up).hitFlag).toBe(true);

      const down = [candle("2026-07-01", 100, 100, 90, 94)];
      expect(computeEvaluationFromOhlcv("BUY", 100, null, down).hitFlag).toBe(false);
    });
  });

  describe("SELL — target reached", () => {
    it("hits when a candle low touches targetPrice", () => {
      const candles = [
        candle("2026-07-01", 200, 202, 195, 197),
        candle("2026-07-02", 197, 198, 188, 190), // low 188 <= target 190
        candle("2026-07-03", 190, 191, 185, 188),
      ];
      const { hitFlag, realizedReturn } = computeEvaluationFromOhlcv("SELL", 200, 190, candles);
      expect(hitFlag).toBe(true);
      expect(realizedReturn).toBeCloseTo(5, 1); // (200-190)/200
    });

    it("misses when no candle low reaches target", () => {
      const candles = [
        candle("2026-07-01", 200, 202, 196, 198),
        candle("2026-07-02", 198, 200, 193, 195),
      ];
      const { hitFlag, realizedReturn } = computeEvaluationFromOhlcv("SELL", 200, 190, candles);
      expect(hitFlag).toBe(false);
      expect(realizedReturn).toBeCloseTo(2.5, 1); // (200-195)/200
    });

    it("no targetPrice: hitFlag follows sign of return", () => {
      const down = [candle("2026-07-01", 200, 200, 175, 180)];
      expect(computeEvaluationFromOhlcv("SELL", 200, null, down).hitFlag).toBe(true);

      const up = [candle("2026-07-01", 200, 215, 200, 212)];
      expect(computeEvaluationFromOhlcv("SELL", 200, null, up).hitFlag).toBe(false);
    });
  });

  it("empty candles → return 0, hitFlag false (no target)", () => {
    const { hitFlag, realizedReturn } = computeEvaluationFromOhlcv("BUY", 100, null, []);
    expect(realizedReturn).toBe(0);
    expect(hitFlag).toBe(false);
  });
});

// ── Integration-style tests for runPerformanceEvaluation ─────────────────────

const { mockFindMany, mockUpdate, mockGetStoredPriceHistoryByRange, mockSyncPriceHistory } =
  vi.hoisted(() => ({
    mockFindMany: vi.fn(),
    mockUpdate: vi.fn(),
    mockGetStoredPriceHistoryByRange: vi.fn(),
    mockSyncPriceHistory: vi.fn().mockResolvedValue(null),
  }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    performanceRecord: {
      findMany: mockFindMany,
      update: mockUpdate,
    },
  },
}));

vi.mock("@/lib/market-data/storePriceHistory", () => ({
  getStoredPriceHistoryByRange: mockGetStoredPriceHistoryByRange,
  upsertPriceHistory: vi.fn(),
}));

vi.mock("@/lib/market-data/priceSync", () => ({
  syncPriceHistory: mockSyncPriceHistory,
}));

vi.mock("@/lib/market-data/yahooFinance", () => ({
  fetchYahooChartByPeriod: vi.fn().mockResolvedValue({ ok: false, error: { message: "no fallback" } }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockSyncPriceHistory.mockResolvedValue(null);
});

describe("runPerformanceEvaluation", () => {
  it("GWT: Given no pending records When run Then returns zero counts", async () => {
    mockFindMany.mockResolvedValue([]);
    const { runPerformanceEvaluation } = await import("../evaluatePerformance");
    const result = await runPerformanceEvaluation(new Date("2026-06-25T21:00:00Z"));
    expect(result).toEqual({ evaluated: 0, skipped: 0, errors: [] });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("GWT: Given expired BUY record whose target was reached When OHLCV available Then evaluates as success", async () => {
    const createdAt = new Date("2026-06-20T00:00:00Z");
    mockFindMany.mockResolvedValue([{
      id: "rec1",
      ticker: "AAPL",
      predictedDirection: "BUY",
      evaluationWindowDays: 3,
      createdAt,
      recommendationCard: { entryPrice: 190, targetPrice: 210 },
    }]);
    // high 215 on day 2 — target 210 reached
    mockGetStoredPriceHistoryByRange.mockResolvedValue([
      candle("2026-06-20", 190, 195, 188, 193),
      candle("2026-06-21", 193, 215, 192, 212),
      candle("2026-06-23", 212, 214, 208, 210),
    ]);
    mockUpdate.mockResolvedValue({});

    const { runPerformanceEvaluation } = await import("../evaluatePerformance");
    const result = await runPerformanceEvaluation(new Date("2026-06-25T21:00:00Z"));

    expect(result.evaluated).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "rec1" },
      data: expect.objectContaining({
        hitFlag: true,
        realizedReturn: expect.closeTo(10.53, 1), // (210-190)/190*100
        evaluatedAt: expect.any(Date),
      }),
    });
  });

  it("GWT: Given expired BUY record whose target was not reached When OHLCV available Then evaluates as failure with last-close return", async () => {
    const createdAt = new Date("2026-06-20T00:00:00Z");
    mockFindMany.mockResolvedValue([{
      id: "rec2",
      ticker: "NVDA",
      predictedDirection: "BUY",
      evaluationWindowDays: 3,
      createdAt,
      recommendationCard: { entryPrice: 100, targetPrice: 120 },
    }]);
    mockGetStoredPriceHistoryByRange.mockResolvedValue([
      candle("2026-06-20", 100, 104, 99, 103),
      candle("2026-06-23", 103, 107, 101, 105), // never hits 120
    ]);
    mockUpdate.mockResolvedValue({});

    const { runPerformanceEvaluation } = await import("../evaluatePerformance");
    const result = await runPerformanceEvaluation(new Date("2026-06-25T21:00:00Z"));

    expect(result.evaluated).toBe(1);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "rec2" },
      data: expect.objectContaining({
        hitFlag: false,
        realizedReturn: expect.closeTo(5, 1), // (105-100)/100
      }),
    });
  });

  it("GWT: Given record not yet expired When run Then skips it", async () => {
    const createdAt = new Date("2026-06-24T00:00:00Z");
    mockFindMany.mockResolvedValue([{
      id: "rec3",
      ticker: "TSLA",
      predictedDirection: "BUY",
      evaluationWindowDays: 5,
      createdAt,
      recommendationCard: { entryPrice: 900, targetPrice: 950 },
    }]);

    const { runPerformanceEvaluation } = await import("../evaluatePerformance");
    // Only 1 day after June 24, window is 5 days — not yet expired
    const result = await runPerformanceEvaluation(new Date("2026-06-25T21:00:00Z"));

    expect(result.evaluated).toBe(0);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("GWT: Given no price data in DB or Yahoo When evaluating Then records error and skips", async () => {
    const createdAt = new Date("2026-06-20T00:00:00Z");
    mockFindMany.mockResolvedValue([{
      id: "rec4",
      ticker: "MSFT",
      predictedDirection: "SELL",
      evaluationWindowDays: 3,
      createdAt,
      recommendationCard: { entryPrice: 430, targetPrice: 400 },
    }]);
    mockGetStoredPriceHistoryByRange.mockResolvedValue([]); // DB miss, fallback also returns []

    const { runPerformanceEvaluation } = await import("../evaluatePerformance");
    const result = await runPerformanceEvaluation(new Date("2026-06-25T21:00:00Z"));

    expect(result.evaluated).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.errors[0]).toContain("MSFT");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("GWT: Given missing entryPrice When evaluating Then skips record", async () => {
    const createdAt = new Date("2026-06-20T00:00:00Z");
    mockFindMany.mockResolvedValue([{
      id: "rec5",
      ticker: "AMZN",
      predictedDirection: "BUY",
      evaluationWindowDays: 3,
      createdAt,
      recommendationCard: { entryPrice: null, targetPrice: 200 },
    }]);

    const { runPerformanceEvaluation } = await import("../evaluatePerformance");
    const result = await runPerformanceEvaluation(new Date("2026-06-25T21:00:00Z"));

    expect(result.skipped).toBe(1);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
