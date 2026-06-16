import { describe, expect, it } from "vitest";
import { buildRecommendationPrompt, type RecommendationPromptInput } from "../promptBuilder";

const baseInput: RecommendationPromptInput = {
  riskMode: "balanced",
  watchlist: [
    { ticker: "AAPL", sector: "Technology", priority: 1 },
    { ticker: "TSLA", sector: "Automotive", priority: 2 },
  ],
  marketData: {
    AAPL: {
      ohlcv: [
        { timestamp: 1717000000, open: 190, high: 195, low: 189, close: 193, volume: 50_000_000 },
        { timestamp: 1717086400, open: 193, high: 198, low: 192, close: 197, volume: 45_000_000 },
      ],
    },
    TSLA: {
      ohlcv: [
        { timestamp: 1717086400, open: 170, high: 175, low: 168, close: 173, volume: 80_000_000 },
      ],
    },
  },
  newsSignals: {
    AAPL: [
      {
        headline: "Apple reports strong earnings",
        source: "Reuters",
        summary: "Beat estimates with stronger services margin",
      },
    ],
    TSLA: [],
  },
};

describe("buildRecommendationPrompt", () => {
  it("includes the legal disclaimer in the system prompt", () => {
    const { system } = buildRecommendationPrompt(baseInput);

    expect(system).toContain("투자 참고용 정보이며 투자 자문이 아님");
    expect(system).toContain("not investment advice");
  });

  it("locks the Decision Layer output shape to three confidence variants", () => {
    const { system } = buildRecommendationPrompt(baseInput);

    expect(system).toContain("exactly 3");
    expect(system).toContain("aggressive");
    expect(system).toContain("balanced");
    expect(system).toContain("conservative");
    expect(system).toContain("confidenceMode");
    expect(system).toContain("status");
    expect(system).toContain("variants");
  });

  it("enforces horizon, reasonLine, no-call, and chart-free constraints", () => {
    const { system } = buildRecommendationPrompt(baseInput);

    expect(system).toContain("1 to 10");
    expect(system).toContain("3-5 business days");
    expect(system).toContain("reasonLine");
    expect(system).toContain("160");
    expect(system).toContain("no_call");
    expect(system).toContain("Do not include candle");
    expect(system).toContain("RSI");
    expect(system).toContain("MACD");
  });

  it("includes watchlist, selected risk mode, OHLCV summary, and news context", () => {
    const { user } = buildRecommendationPrompt(baseInput);

    expect(user).toContain("SELECTED RISK MODE: balanced");
    expect(user).toContain("AAPL");
    expect(user).toContain("Technology");
    expect(user).toContain("TSLA");
    expect(user).toContain("Open: 193.00");
    expect(user).toContain("Close: 197.00");
    expect(user).toContain("Volume: 45,000,000");
    expect(user).toContain("Apple reports strong earnings");
    expect(user).toContain("Reuters");
  });

  it("marks missing market or news data as insufficient context", () => {
    const { user } = buildRecommendationPrompt({
      ...baseInput,
      marketData: {},
      newsSignals: {},
    });

    expect(user).toContain("AAPL: No OHLCV data available");
    expect(user).toContain("AAPL: No recent news signals");
    expect(user).toContain("TSLA: No OHLCV data available");
    expect(user).toContain("TSLA: No recent news signals");
  });

  it("rejects an empty watchlist before an LLM call is attempted", () => {
    expect(() =>
      buildRecommendationPrompt({
        ...baseInput,
        watchlist: [],
      }),
    ).toThrow("watchlist must contain at least one item");
  });
});
