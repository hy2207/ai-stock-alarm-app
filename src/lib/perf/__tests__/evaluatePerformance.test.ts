import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeEvaluation } from "../evaluatePerformance";

// ── Pure unit tests for computeEvaluation ──────────────────────────────────

describe("computeEvaluation", () => {
  describe("BUY direction", () => {
    it("hit when currentPrice >= targetPrice", () => {
      const result = computeEvaluation("BUY", 100, 115, 110);
      expect(result.hitFlag).toBe(true);
      expect(result.realizedReturn).toBeCloseTo(15, 1);
    });

    it("miss when currentPrice < targetPrice", () => {
      const result = computeEvaluation("BUY", 100, 105, 110);
      expect(result.hitFlag).toBe(false);
      expect(result.realizedReturn).toBeCloseTo(5, 1);
    });

    it("miss with negative return when price fell", () => {
      const result = computeEvaluation("BUY", 100, 90, 110);
      expect(result.hitFlag).toBe(false);
      expect(result.realizedReturn).toBeCloseTo(-10, 1);
    });

    it("uses positive-return fallback when no targetPrice", () => {
      const up = computeEvaluation("BUY", 100, 105, null);
      expect(up.hitFlag).toBe(true);

      const down = computeEvaluation("BUY", 100, 95, null);
      expect(down.hitFlag).toBe(false);
    });
  });

  describe("SELL direction", () => {
    it("hit when currentPrice <= targetPrice (price fell)", () => {
      const result = computeEvaluation("SELL", 100, 85, 90);
      expect(result.hitFlag).toBe(true);
      expect(result.realizedReturn).toBeCloseTo(15, 1);
    });

    it("miss when currentPrice > targetPrice (price rose)", () => {
      const result = computeEvaluation("SELL", 100, 105, 90);
      expect(result.hitFlag).toBe(false);
      expect(result.realizedReturn).toBeCloseTo(-5, 1);
    });

    it("uses positive-return fallback when no targetPrice", () => {
      const down = computeEvaluation("SELL", 100, 90, null);
      expect(down.hitFlag).toBe(true);

      const up = computeEvaluation("SELL", 100, 110, null);
      expect(up.hitFlag).toBe(false);
    });
  });

  it("returns raw floating point realizedReturn (rounding is done in the orchestrator)", () => {
    // (400 - 300) / 300 * 100 = 33.333...
    const result = computeEvaluation("BUY", 300, 400, null);
    expect(result.realizedReturn).toBeCloseTo(33.33, 1);
  });
});

// ── Integration-style tests for runPerformanceEvaluation ───────────────────

const { mockFindMany, mockUpdate, mockFetchYahooChart } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockUpdate: vi.fn(),
  mockFetchYahooChart: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    performanceRecord: {
      findMany: mockFindMany,
      update: mockUpdate,
    },
  },
}));

vi.mock("@/lib/market-data/yahooFinance", () => ({
  fetchYahooChart: mockFetchYahooChart,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("runPerformanceEvaluation", () => {
  it("GWT: Given no pending records When run Then returns zero counts", async () => {
    mockFindMany.mockResolvedValue([]);
    const { runPerformanceEvaluation } = await import("../evaluatePerformance");
    const result = await runPerformanceEvaluation(new Date("2026-06-25T21:00:00Z"));
    expect(result).toEqual({ evaluated: 0, skipped: 0, errors: [] });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("GWT: Given expired pending BUY record When market data available Then evaluates and updates", async () => {
    const createdAt = new Date("2026-06-20T00:00:00Z");
    mockFindMany.mockResolvedValue([
      {
        id: "rec1",
        ticker: "AAPL",
        predictedDirection: "BUY",
        evaluationWindowDays: 3,
        createdAt,
        recommendationCard: { entryPrice: 190, targetPrice: 210 },
      },
    ]);
    mockFetchYahooChart.mockResolvedValue({
      ok: true,
      data: { regularMarketPrice: 215, ticker: "AAPL", previousClose: 210, ohlcv: [] },
    });
    mockUpdate.mockResolvedValue({});

    const { runPerformanceEvaluation } = await import("../evaluatePerformance");
    // 3 days after June 20 = June 23, so June 25 is past expiry
    const result = await runPerformanceEvaluation(new Date("2026-06-25T21:00:00Z"));

    expect(result.evaluated).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "rec1" },
      data: expect.objectContaining({
        hitFlag: true,
        realizedReturn: expect.closeTo(13.16, 1),
        evaluatedAt: expect.any(Date),
      }),
    });
  });

  it("GWT: Given record not yet expired When run Then skips it", async () => {
    const createdAt = new Date("2026-06-24T00:00:00Z");
    mockFindMany.mockResolvedValue([
      {
        id: "rec2",
        ticker: "NVDA",
        predictedDirection: "BUY",
        evaluationWindowDays: 5,
        createdAt,
        recommendationCard: { entryPrice: 900, targetPrice: 950 },
      },
    ]);

    const { runPerformanceEvaluation } = await import("../evaluatePerformance");
    // only 1 day after June 24, window is 5 days
    const result = await runPerformanceEvaluation(new Date("2026-06-25T21:00:00Z"));

    expect(result.evaluated).toBe(0);
    expect(result.skipped).toBe(0);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("GWT: Given Yahoo Finance error When evaluating Then records error and skips ticker", async () => {
    const createdAt = new Date("2026-06-20T00:00:00Z");
    mockFindMany.mockResolvedValue([
      {
        id: "rec3",
        ticker: "TSLA",
        predictedDirection: "SELL",
        evaluationWindowDays: 3,
        createdAt,
        recommendationCard: { entryPrice: 250, targetPrice: 220 },
      },
    ]);
    mockFetchYahooChart.mockResolvedValue({
      ok: false,
      error: { code: "HTTP_ERROR", message: "Yahoo Finance returned 429" },
    });

    const { runPerformanceEvaluation } = await import("../evaluatePerformance");
    const result = await runPerformanceEvaluation(new Date("2026-06-25T21:00:00Z"));

    expect(result.evaluated).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("TSLA");
  });

  it("GWT: Given missing entryPrice When evaluating Then skips record", async () => {
    const createdAt = new Date("2026-06-20T00:00:00Z");
    mockFindMany.mockResolvedValue([
      {
        id: "rec4",
        ticker: "MSFT",
        predictedDirection: "BUY",
        evaluationWindowDays: 3,
        createdAt,
        recommendationCard: { entryPrice: null, targetPrice: 440 },
      },
    ]);
    mockFetchYahooChart.mockResolvedValue({
      ok: true,
      data: { regularMarketPrice: 445, ticker: "MSFT", previousClose: 440, ohlcv: [] },
    });

    const { runPerformanceEvaluation } = await import("../evaluatePerformance");
    const result = await runPerformanceEvaluation(new Date("2026-06-25T21:00:00Z"));

    expect(result.evaluated).toBe(0);
    expect(result.skipped).toBe(1);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
