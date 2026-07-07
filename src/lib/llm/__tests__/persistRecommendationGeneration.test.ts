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
      currentPrice: 190,
      entryPrice: 190,
      targetPrice: 205,
      exitPrice: 211,
      holdDays: 3,
      confidenceMode: "aggressive",
      reasonLine: "수요 강세와 거래 흐름이 단기 매수 판단을 뒷받침합니다.",
      newsItems: [
        { source: "Reuters", headlineKo: "수요 강세 지속", summaryKo: "수요 강세 뉴스가 공격형 단기 매수 판단을 뒷받침합니다." },
      ],
    },
    {
      ticker: "AAPL",
      direction: "BUY",
      currentPrice: 190,
      entryPrice: 188,
      targetPrice: 205,
      exitPrice: 203,
      holdDays: 4,
      confidenceMode: "balanced",
      reasonLine: "추세가 유지되어 중립형 기준의 매수 판단이 유효합니다.",
      newsItems: [
        { source: "Reuters", headlineKo: "긍정적 뉴스 지속", summaryKo: "긍정적 뉴스가 중립형 매수 판단을 지지합니다." },
      ],
    },
    {
      ticker: "AAPL",
      direction: "BUY",
      currentPrice: 190,
      entryPrice: 185,
      targetPrice: 205,
      exitPrice: 198,
      holdDays: 5,
      confidenceMode: "conservative",
      reasonLine: "우호적 흐름은 유지되지만 안정형은 방어적 접근이 적절합니다.",
      newsItems: [
        { source: "Reuters", headlineKo: "우호적 뉴스 흐름", summaryKo: "뉴스 흐름은 우호적이지만 안정형은 방어적 접근이 적절합니다." },
      ],
    },
  ],
} satisfies RecommendationGeneration;

describe("persistRecommendationGeneration", () => {
  it("GWT: Given three variants When persisting Then creates published cards", async () => {
    mockCreate.mockImplementation(({ data }) => Promise.resolve({ id: data.confidenceScore, ...data }));

    const result = await persistRecommendationGeneration({
      userId: "clxuser000000000000000001",
      generation,
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
          currentPrice: 190,
          newsItems: [{ source: "Reuters", headlineKo: "수요 강세 지속", summaryKo: "수요 강세 뉴스가 공격형 단기 매수 판단을 뒷받침합니다." }],
          validUntil: new Date("2026-06-22T00:00:00.000Z"),
          performanceRecords: {
            create: {
              ticker: "AAPL",
              predictedDirection: "BUY",
              evaluationWindowDays: 3,
            },
          },
        }),
      }),
    );
  });

  it("GWT: Given closes When persisting Then stores a quantForecast per variant at its holdDays horizon", async () => {
    mockCreate.mockClear();
    mockTransaction.mockClear();
    mockCreate.mockImplementation(({ data }) => Promise.resolve({ id: data.confidenceScore, ...data }));

    // 30 days of a clean uptrend around the card's price level
    const closes = Array.from({ length: 30 }, (_, i) => 160 + i);

    await persistRecommendationGeneration({
      userId: "clxuser000000000000000001",
      generation,
      closes,
      now: new Date("2026-06-19T00:00:00.000Z"),
    });

    expect(mockCreate).toHaveBeenCalledTimes(3);
    for (const call of mockCreate.mock.calls) {
      const { quantForecast, holdDays } = call[0].data;
      expect(quantForecast).not.toBeNull();
      expect(quantForecast.horizonDays).toBe(holdDays);
      expect(quantForecast.expectedPrice).toBeGreaterThan(189); // continues uptrend past last close
      expect(quantForecast.method).toBe("holt+linreg");
    }
  });

  it("GWT: Given no closes When persisting Then quantForecast is null", async () => {
    mockCreate.mockClear();
    mockTransaction.mockClear();
    mockCreate.mockImplementation(({ data }) => Promise.resolve({ id: data.confidenceScore, ...data }));

    await persistRecommendationGeneration({
      userId: "clxuser000000000000000001",
      generation,
      now: new Date("2026-06-19T00:00:00.000Z"),
    });

    for (const call of mockCreate.mock.calls) {
      expect(call[0].data.quantForecast).toBeNull();
    }
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
