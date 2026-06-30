import { beforeEach, describe, expect, it, vi } from "vitest";

const mockWatchlistFindMany = vi.fn();
const mockRiskProfileFindUnique = vi.fn();
const mockRecommendationCardFindMany = vi.fn();
const mockRecommendationCardDeleteMany = vi.fn();
const mockRecommendationCardCreate = vi.fn();
const mockTransaction = vi.fn();
const mockFetchFinnhubCandle = vi.fn();
const mockFetchFinnhubNews = vi.fn();
const mockFetchYahooChart = vi.fn();
const mockGenerateRecommendationCards = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    watchlist: {
      findMany: mockWatchlistFindMany,
    },
    riskProfile: {
      findUnique: mockRiskProfileFindUnique,
    },
    recommendationCard: {
      findMany: mockRecommendationCardFindMany,
      deleteMany: mockRecommendationCardDeleteMany,
      create: mockRecommendationCardCreate,
    },
    $transaction: mockTransaction,
  },
}));

vi.mock("@/lib/market-data", () => ({
  fetchFinnhubCandle: mockFetchFinnhubCandle,
  fetchFinnhubNews: mockFetchFinnhubNews,
}));

vi.mock("@/lib/market-data/yahooFinance", () => ({
  fetchYahooChart: mockFetchYahooChart,
}));

vi.mock("@/lib/llm/generateRecommendationCards", () => ({
  generateRecommendationCards: mockGenerateRecommendationCards,
}));

const okGeneration = {
  status: "ok" as const,
  variants: [
    {
      ticker: "AAPL",
      direction: "BUY" as const,
      currentPrice: 197,
      entryPrice: 197,
      targetPrice: 208,
      exitPrice: 214,
      holdDays: 3,
      confidenceMode: "aggressive" as const,
      reasonLine: "서비스 마진 개선과 가격 흐름이 단기 매수 판단을 뒷받침합니다.",
      newsItems: [{ source: "Reuters", headlineKo: "서비스 마진 개선", summaryKo: "서비스 마진 개선 뉴스가 공격형 매수 판단을 뒷받침합니다.", publishedAt: "2026-06-27 14:30 ET" }],
    },
    {
      ticker: "AAPL",
      direction: "BUY" as const,
      currentPrice: 197,
      entryPrice: 195,
      targetPrice: 208,
      exitPrice: 206,
      holdDays: 5,
      confidenceMode: "balanced" as const,
      reasonLine: "실적 개선 신호가 3~5일 중립형 매수 판단을 뒷받침합니다.",
      newsItems: [{ source: "Reuters", headlineKo: "실적 개선 신호", summaryKo: "실적 개선 뉴스가 중립형 매수 판단을 지지합니다.", publishedAt: "2026-06-27 14:30 ET" }],
    },
    {
      ticker: "AAPL",
      direction: "BUY" as const,
      currentPrice: 197,
      entryRangeLow: 192,
      entryRangeHigh: 196,
      targetPrice: 208,
      exitPrice: 202,
      holdDays: 5,
      confidenceMode: "conservative" as const,
      reasonLine: "서비스 강세는 유지되지만 안정형은 매도 기준을 앞당기는 접근이 적절합니다.",
      newsItems: [{ source: "Reuters", headlineKo: "서비스 강세 지속", summaryKo: "서비스 강세는 유지되지만 안정형은 방어적 접근이 적절합니다.", publishedAt: "2026-06-27 14:30 ET" }],
    },
  ],
};

function completeCard(ticker: string, confidenceScore: string) {
  const exitPriceByMode: Record<string, number> = {
    aggressive: 214,
    balanced: 206,
    conservative: 202,
  };

  return {
    ticker,
    confidenceScore,
    direction: "BUY",
    currentPrice: 197,
    targetPrice: 208,
    targetRangeLow: null,
    targetRangeHigh: null,
    exitPrice: exitPriceByMode[confidenceScore],
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("FINNHUB_API_KEY", "test-finnhub-key");
  mockWatchlistFindMany.mockResolvedValue([
    { ticker: "AAPL", sector: "Technology", priority: 1 },
  ]);
  mockRiskProfileFindUnique.mockResolvedValue({ riskMode: "balanced" });
  mockRecommendationCardFindMany.mockResolvedValue([]);
  mockRecommendationCardDeleteMany.mockResolvedValue({ count: 0 });
  mockFetchFinnhubCandle.mockResolvedValue({
    ok: true,
    data: {
      ticker: "AAPL",
      regularMarketPrice: 197,
      previousClose: 193,
      ohlcv: [
        {
          timestamp: 1717086400,
          open: 193,
          high: 198,
          low: 192,
          close: 197,
          volume: 45_000_000,
        },
      ],
    },
  });
  mockFetchFinnhubNews.mockResolvedValue({
    ok: true,
    data: [
      {
        id: 1,
        headline: "Apple reports stronger services margin",
        summary: "Margin expansion continues.",
        source: "Reuters",
        url: "https://example.com",
        datetime: 1717086400,
      },
    ],
  });
  mockFetchYahooChart.mockResolvedValue({
    ok: true,
    data: {
      ticker: "AAPL",
      regularMarketPrice: 197,
      previousClose: 193,
      ohlcv: [
        {
          timestamp: 1717086400,
          open: 193,
          high: 198,
          low: 192,
          close: 197,
          volume: 45_000_000,
        },
      ],
    },
  });
  mockGenerateRecommendationCards.mockResolvedValue(okGeneration);
  mockTransaction.mockImplementation(async (operations: Promise<unknown>[]) =>
    Promise.all(operations),
  );
  mockRecommendationCardCreate.mockImplementation((args: { data: { ticker: string } }) =>
    Promise.resolve({
      id: `card-${args.data.ticker}`,
      ...args.data,
      createdAt: new Date(),
      validUntil: new Date(),
    }),
  );
});

describe("generateRecommendationsForUser", () => {
  it("returns validation error when watchlist is empty", async () => {
    mockWatchlistFindMany.mockResolvedValue([]);

    const { generateRecommendationsForUser } = await import(
      "../generateRecommendationsForUser"
    );
    const result = await generateRecommendationsForUser(
      "clxuserid00000000000001",
    );

    expect(result).toEqual({
      generatedCount: 0,
      skippedCount: 0,
      validationErrors: ["Watchlist is empty. Add at least one ticker first."],
      externalApiErrors: [],
    });
    expect(mockGenerateRecommendationCards).not.toHaveBeenCalled();
  });

  it("skips generation when all risk variants already exist for the ticker today", async () => {
    mockRecommendationCardFindMany.mockResolvedValue([
      completeCard("AAPL", "aggressive"),
      completeCard("AAPL", "balanced"),
      completeCard("AAPL", "conservative"),
    ]);

    const { generateRecommendationsForUser } = await import(
      "../generateRecommendationsForUser"
    );
    const result = await generateRecommendationsForUser(
      "clxuserid00000000000001",
    );

    expect(result.generatedCount).toBe(0);
    expect(result.skippedCount).toBe(1);
    expect(mockGenerateRecommendationCards).not.toHaveBeenCalled();
  });

  it("skips generation when the daily card limit is already reached", async () => {
    mockRecommendationCardFindMany.mockResolvedValue([
      completeCard("AAPL", "aggressive"),
      completeCard("AAPL", "balanced"),
      completeCard("AAPL", "conservative"),
      completeCard("MSFT", "aggressive"),
      completeCard("MSFT", "balanced"),
      completeCard("MSFT", "conservative"),
      completeCard("NVDA", "aggressive"),
      completeCard("NVDA", "balanced"),
      completeCard("NVDA", "conservative"),
    ]);

    const { generateRecommendationsForUser } = await import(
      "../generateRecommendationsForUser"
    );
    const result = await generateRecommendationsForUser(
      "clxuserid00000000000001",
    );

    expect(result).toEqual({
      generatedCount: 0,
      skippedCount: 1,
      validationErrors: [],
      externalApiErrors: [],
    });
    expect(mockGenerateRecommendationCards).not.toHaveBeenCalled();
  });

  it("reports Finnhub configuration errors without calling Gemini in production", async () => {
    vi.stubEnv("FINNHUB_API_KEY", "");
    vi.stubEnv("NODE_ENV", "production");

    const { generateRecommendationsForUser } = await import(
      "../generateRecommendationsForUser"
    );
    const result = await generateRecommendationsForUser(
      "clxuserid00000000000001",
    );

    expect(result.externalApiErrors).toContain(
      "FINNHUB_API_KEY is not configured. Set it in your environment.",
    );
    expect(result.generatedCount).toBe(0);
    expect(mockGenerateRecommendationCards).not.toHaveBeenCalled();
  });

  it("uses Yahoo Finance fallback when Finnhub token is missing outside production", async () => {
    vi.stubEnv("FINNHUB_API_KEY", "");
    vi.stubEnv("NODE_ENV", "development");

    const { generateRecommendationsForUser } = await import(
      "../generateRecommendationsForUser"
    );
    const result = await generateRecommendationsForUser(
      "clxuserid00000000000001",
    );

    expect(mockFetchFinnhubCandle).not.toHaveBeenCalled();
    expect(mockFetchFinnhubNews).not.toHaveBeenCalled();
    expect(mockFetchYahooChart).toHaveBeenCalledWith("AAPL");
    expect(result.generatedCount).toBe(1);
    expect(result.externalApiErrors).toContain(
      "Finnhub candle (AAPL): FINNHUB_API_KEY is not configured. Using Yahoo Finance fallback.",
    );
    expect(mockGenerateRecommendationCards).toHaveBeenCalledWith({
      promptInput: expect.objectContaining({
        marketData: expect.objectContaining({
          AAPL: expect.objectContaining({
            ohlcv: expect.any(Array),
          }),
        }),
      }),
    });
  });

  it("persists up to three validated cards for the authenticated user", async () => {
    const { generateRecommendationsForUser } = await import(
      "../generateRecommendationsForUser"
    );
    const result = await generateRecommendationsForUser(
      "clxuserid00000000000001",
    );

    expect(result.generatedCount).toBe(1);
    expect(result.skippedCount).toBe(0);
    expect(result.validationErrors).toEqual([]);
    expect(mockGenerateRecommendationCards).toHaveBeenCalledWith({
      promptInput: expect.objectContaining({
        riskMode: "balanced",
        watchlist: [{ ticker: "AAPL", sector: "Technology", priority: 1 }],
      }),
    });
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockRecommendationCardCreate).toHaveBeenCalledTimes(3);
    expect(mockRecommendationCardDeleteMany).toHaveBeenCalledWith({
      where: {
        userId: "clxuserid00000000000001",
        ticker: "AAPL",
        status: "published",
        createdAt: expect.objectContaining({
          gte: expect.any(Date),
          lt: expect.any(Date),
        }),
      },
    });
  });

  it("returns validation errors when Gemini returns no_call", async () => {
    mockGenerateRecommendationCards.mockResolvedValue({
      status: "no_call",
      reason: "Insufficient market context.",
    });

    const { generateRecommendationsForUser } = await import(
      "../generateRecommendationsForUser"
    );
    const result = await generateRecommendationsForUser(
      "clxuserid00000000000001",
    );

    expect(result.generatedCount).toBe(0);
    expect(result.validationErrors).toEqual(["AAPL: Insufficient market context."]);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("falls back to Yahoo Finance when Finnhub candle data is unavailable", async () => {
    mockFetchFinnhubCandle.mockResolvedValue({
      ok: false,
      error: { code: "HTTP_ERROR", message: "You don't have access to this resource." },
    });
    mockFetchYahooChart.mockResolvedValue({
      ok: true,
      data: {
        ticker: "AAPL",
        regularMarketPrice: 197,
        previousClose: 193,
        ohlcv: [
          {
            timestamp: 1717086400,
            open: 193,
            high: 198,
            low: 192,
            close: 197,
            volume: 45_000_000,
          },
        ],
      },
    });

    const { generateRecommendationsForUser } = await import(
      "../generateRecommendationsForUser"
    );
    const result = await generateRecommendationsForUser(
      "clxuserid00000000000001",
    );

    expect(mockFetchYahooChart).toHaveBeenCalledWith("AAPL");
    expect(result.generatedCount).toBe(1);
    expect(mockGenerateRecommendationCards).toHaveBeenCalledWith({
      promptInput: expect.objectContaining({
        marketData: {
          AAPL: {
            ohlcv: [
              {
                timestamp: 1717086400,
                open: 193,
                high: 198,
                low: 192,
                close: 197,
                volume: 45_000_000,
              },
            ],
          },
        },
      }),
    });
  });

  it("collects external API errors while still attempting generation", async () => {
    mockFetchFinnhubCandle.mockResolvedValue({
      ok: false,
      error: { code: "HTTP_ERROR", message: "Finnhub returned 429" },
    });
    mockFetchFinnhubNews.mockResolvedValue({
      ok: false,
      error: { code: "HTTP_ERROR", message: "Finnhub news returned 500" },
    });

    const { generateRecommendationsForUser } = await import(
      "../generateRecommendationsForUser"
    );
    const result = await generateRecommendationsForUser(
      "clxuserid00000000000001",
    );

    expect(result.externalApiErrors).toEqual([
      "Finnhub candle (AAPL): Finnhub returned 429",
      "Finnhub news (AAPL): Finnhub news returned 500",
    ]);
    expect(mockGenerateRecommendationCards).toHaveBeenCalled();
  });
});
