import { describe, it, expect } from "vitest";
import {
  mockYahooChartResponseAAPL,
  mockYahooChartResponseTSLA,
  mockYahooChartResponseEmpty,
  mockYahooQuoteResponseAAPL,
  mockYahooQuoteResponseError,
} from "../mock/yahooFinance";
import {
  mockFinnhubCandleAAPL,
  mockFinnhubCandleTSLA,
  mockFinnhubCandleEmpty,
  mockFinnhubNewsAAPL,
  mockFinnhubNewsEmpty,
} from "../mock/finnhub";

describe("Yahoo Finance mock data", () => {
  it("AAPL chart response has valid structure", () => {
    const result = mockYahooChartResponseAAPL.chart.result[0];
    expect(result.meta.symbol).toBe("AAPL");
    expect(result.timestamp).toHaveLength(5);
    expect(result.indicators.quote[0].close).toHaveLength(5);
  });

  it("TSLA chart response has matching data lengths", () => {
    const indicators = mockYahooChartResponseTSLA.chart.result[0].indicators
      .quote[0];
    expect(indicators.open.length).toBe(5);
    expect(indicators.high.length).toBe(indicators.low.length);
    expect(indicators.close.length).toBe(indicators.volume.length);
  });

  it("empty chart response has empty result array", () => {
    expect(mockYahooChartResponseEmpty.chart.result).toHaveLength(0);
    expect(mockYahooChartResponseEmpty.chart.error).toBeNull();
  });

  it("quote response has expected fields", () => {
    const quote = mockYahooQuoteResponseAAPL.quoteResponse.result[0];
    expect(quote.symbol).toBe("AAPL");
    expect(quote.regularMarketPrice).toBeGreaterThan(0);
    expect(quote.marketCap).toBeGreaterThan(0);
  });

  it("error quote response has error description", () => {
    const err = mockYahooQuoteResponseError.quoteResponse.error;
    expect(err?.code).toBe("NOT_FOUND");
    expect(err?.description).toBeDefined();
  });
});

describe("Finnhub mock data", () => {
  it("AAPL candle response has matching array lengths", () => {
    expect(mockFinnhubCandleAAPL.c).toHaveLength(5);
    expect(mockFinnhubCandleAAPL.h).toHaveLength(mockFinnhubCandleAAPL.l.length);
    expect(mockFinnhubCandleAAPL.s).toBe("ok");
  });

  it("TSLA candle response has 5 data points", () => {
    expect(mockFinnhubCandleTSLA.t).toHaveLength(5);
    expect(mockFinnhubCandleTSLA.v.length).toBe(5);
  });

  it("empty candle response returns no_data status", () => {
    expect(mockFinnhubCandleEmpty.s).toBe("no_data");
    expect(mockFinnhubCandleEmpty.c).toHaveLength(0);
  });

  it("AAPL news response has article fields", () => {
    const article = mockFinnhubNewsAAPL[0];
    expect(article.headline).toContain("Apple");
    expect(article.url).toMatch(/^https?:\/\//);
    expect(article.id).toBeGreaterThan(0);
  });

  it("empty news response is an empty array", () => {
    expect(mockFinnhubNewsEmpty).toHaveLength(0);
  });

  it("price arrays are internally consistent (high >= low)", () => {
    for (let i = 0; i < mockFinnhubCandleAAPL.h.length; i++) {
      expect(mockFinnhubCandleAAPL.h[i]).toBeGreaterThanOrEqual(
        mockFinnhubCandleAAPL.l[i],
      );
    }
  });
});
