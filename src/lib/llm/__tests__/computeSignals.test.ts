import { describe, it, expect } from "vitest";
import { computeSignals } from "../computeSignals";
import type { OhlcvPoint, NewsArticle } from "@/lib/market-data/types";

describe("computeSignals", () => {
  it("returns null news signal when no articles", () => {
    const result = computeSignals([], mockOhlcv(3));
    expect(result.newsSignalScore).toBeNull();
  });

  it("computes positive news signal for bullish articles", () => {
    const articles: NewsArticle[] = [
      {
        id: 1,
        headline: "Apple beats earnings estimates with record profit",
        summary: "Strong revenue growth across all segments",
        source: "Reuters",
        url: "https://example.com",
        datetime: 1717000000,
      },
    ];

    const result = computeSignals(articles, mockOhlcv(3));
    expect(result.newsSignalScore).toBeGreaterThan(0);
  });

  it("computes negative news signal for bearish articles", () => {
    const articles: NewsArticle[] = [
      {
        id: 1,
        headline: "Company misses revenue targets, earnings decline",
        summary: "Losses mount amid weak demand and market downturn",
        source: "Reuters",
        url: "https://example.com",
        datetime: 1717000000,
      },
    ];

    const result = computeSignals(articles, mockOhlcv(3));
    expect(result.newsSignalScore).toBeLessThan(0);
  });

  it("returns null volume signal with single OHLCV point", () => {
    const result = computeSignals([], mockOhlcv(1));
    expect(result.volumeSignalScore).toBeNull();
  });

  it("computes positive volume signal for elevated volume", () => {
    const ohlcv = mockOhlcvBase();
    ohlcv[0].volume = 1_000_000;
    ohlcv[1].volume = 3_000_000;
    ohlcv[2].volume = 5_000_000;

    const result = computeSignals([], ohlcv);
    expect(result.volumeSignalScore).toBeGreaterThan(0);
  });

  it("computes negative volume signal for diminished volume", () => {
    const ohlcv = mockOhlcvBase();
    ohlcv[0].volume = 10_000_000;
    ohlcv[1].volume = 8_000_000;
    ohlcv[2].volume = 2_000_000;

    const result = computeSignals([], ohlcv);
    expect(result.volumeSignalScore).toBeLessThan(0);
  });

  it("detects bull flag pattern", () => {
    const ohlcv: OhlcvPoint[] = [
      { timestamp: 1, open: 100, high: 102, low: 99, close: 101, volume: 1_000_000 },
      { timestamp: 2, open: 101, high: 104, low: 100, close: 103, volume: 1_200_000 },
      { timestamp: 3, open: 103, high: 106, low: 102, close: 105, volume: 1_500_000 },
    ];

    const result = computeSignals([], ohlcv);
    expect(result.patternTag).toBe("bull_flag");
  });

  it("detects bear flag pattern", () => {
    const ohlcv: OhlcvPoint[] = [
      { timestamp: 1, open: 105, high: 106, low: 103, close: 104, volume: 1_000_000 },
      { timestamp: 2, open: 104, high: 105, low: 101, close: 102, volume: 1_200_000 },
      { timestamp: 3, open: 102, high: 103, low: 99, close: 100, volume: 1_500_000 },
    ];

    const result = computeSignals([], ohlcv);
    expect(result.patternTag).toBe("bear_flag");
  });

  it("returns null community signal (not implemented)", () => {
    const result = computeSignals([], mockOhlcv(3));
    expect(result.communitySignalScore).toBeNull();
  });
});

function mockOhlcv(len: number): OhlcvPoint[] {
  return mockOhlcvBase().slice(0, len);
}

function mockOhlcvBase(): OhlcvPoint[] {
  return [
    { timestamp: 1, open: 100, high: 102, low: 99, close: 101, volume: 1_000_000 },
    { timestamp: 2, open: 101, high: 103, low: 100, close: 102, volume: 1_100_000 },
    { timestamp: 3, open: 102, high: 104, low: 101, close: 103, volume: 1_200_000 },
  ];
}
