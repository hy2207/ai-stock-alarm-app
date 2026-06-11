import { describe, it, expect } from "vitest";
import { buildPrompt, type PromptInput } from "../promptBuilder";

const baseInput: PromptInput = {
  watchlist: [{ ticker: "AAPL", sector: "Technology", priority: 1 }],
  ohlcvData: {
    AAPL: [
      { timestamp: 1717000000, open: 190, high: 195, low: 189, close: 193, volume: 50_000_000 },
      { timestamp: 1717086400, open: 193, high: 198, low: 192, close: 197, volume: 45_000_000 },
    ],
  },
  newsData: {
    AAPL: [
      { id: 1, headline: "Apple reports strong earnings", summary: "Beat estimates", source: "Reuters", url: "https://example.com", datetime: 1717000000 },
    ],
  },
  riskMode: "balanced",
};

describe("buildPrompt", () => {
  it("system prompt includes disclaimer text", () => {
    const { system } = buildPrompt(baseInput);
    expect(system).toContain("not investment advice");
    expect(system).toContain("aggressive");
    expect(system).toContain("balanced");
    expect(system).toContain("conservative");
  });

  it("user prompt includes risk mode", () => {
    const { user } = buildPrompt(baseInput);
    expect(user).toContain("BALANCED");
  });

  it("user prompt includes watchlist tickers", () => {
    const { user } = buildPrompt(baseInput);
    expect(user).toContain("AAPL");
    expect(user).toContain("Technology");
  });

  it("user prompt includes OHLCV summary", () => {
    const { user } = buildPrompt(baseInput);
    expect(user).toContain("$197.00");
    expect(user).toContain("High:");
  });

  it("user prompt includes news headlines", () => {
    const { user } = buildPrompt(baseInput);
    expect(user).toContain("Apple reports strong earnings");
    expect(user).toContain("Reuters");
  });

  it("handles aggressive risk mode", () => {
    const { user } = buildPrompt({ ...baseInput, riskMode: "aggressive" });
    expect(user).toContain("AGGRESSIVE");
  });

  it("handles conservative risk mode", () => {
    const { user } = buildPrompt({ ...baseInput, riskMode: "conservative" });
    expect(user).toContain("CONSERVATIVE");
  });

  it("handles empty news gracefully", () => {
    const input: PromptInput = {
      ...baseInput,
      newsData: { AAPL: [] },
    };
    const { user } = buildPrompt(input);
    expect(user).toContain("No recent news");
  });

  it("handles empty OHLCV data gracefully", () => {
    const input: PromptInput = {
      ...baseInput,
      ohlcvData: { AAPL: [] },
    };
    const { user } = buildPrompt(input);
    expect(user).toContain("No price data available");
  });

  it("handles multiple watchlist items", () => {
    const input: PromptInput = {
      watchlist: [
        { ticker: "AAPL", sector: "Technology", priority: 1 },
        { ticker: "TSLA", sector: "Automotive", priority: 2 },
      ],
      ohlcvData: {
        AAPL: [{ timestamp: 1717000000, open: 190, high: 195, low: 189, close: 193, volume: 50_000_000 }],
        TSLA: [{ timestamp: 1717000000, open: 170, high: 175, low: 168, close: 173, volume: 80_000_000 }],
      },
      newsData: {
        AAPL: [],
        TSLA: [],
      },
      riskMode: "balanced",
    };
    const { user } = buildPrompt(input);
    expect(user).toContain("AAPL");
    expect(user).toContain("TSLA");
  });

  it("returns both system and user prompts", () => {
    const result = buildPrompt(baseInput);
    expect(result).toHaveProperty("system");
    expect(result).toHaveProperty("user");
    expect(result.system.length).toBeGreaterThan(100);
    expect(result.user.length).toBeGreaterThan(100);
  });
});
