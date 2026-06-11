import { describe, it, expect } from "vitest";
import type { FinnhubCandleResponse } from "../../market-data/finnhub";
import type { OhlcvPoint } from "../../market-data/types";
import {
  mockFinnhubCandleAAPL,
  mockFinnhubCandleTSLA,
  mockFinnhubCandleEmpty,
  mockFinnhubNewsAAPL,
  mockFinnhubNewsTSLA,
  mockFinnhubNewsEmpty,
} from "../finnhub";

type FinnhubNewsItem = {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  category: string;
  related: string;
  image: string;
};

// ── Finnhub candle mocks ────────────────────────────────────────────

describe("Finnhub candle mock fixtures", () => {
  it("mockFinnhubCandleAAPL satisfies FinnhubCandleResponse", () => {
    // Compile-time check: assign to typed variable
    const candle: FinnhubCandleResponse = mockFinnhubCandleAAPL;
    expect(candle.s).toBe("ok");
    expect(candle.c.length).toBe(5);
    expect(candle.c[0]).toBeGreaterThan(0);
  });

  it("mockFinnhubCandleTSLA satisfies FinnhubCandleResponse", () => {
    const candle: FinnhubCandleResponse = mockFinnhubCandleTSLA;
    expect(candle.s).toBe("ok");
    expect(candle.t.length).toBe(candle.c.length);
  });

  it("mockFinnhubCandleEmpty is no_data with empty arrays", () => {
    const candle: FinnhubCandleResponse = mockFinnhubCandleEmpty;
    expect(candle.s).toBe("no_data");
    expect(candle.c).toHaveLength(0);
    expect(candle.h).toHaveLength(0);
    expect(candle.l).toHaveLength(0);
    expect(candle.o).toHaveLength(0);
    expect(candle.v).toHaveLength(0);
    expect(candle.t).toHaveLength(0);
  });

  it("candle OHLCV arrays are consistent length", () => {
    const candles = [mockFinnhubCandleAAPL, mockFinnhubCandleTSLA];
    for (const c of candles) {
      expect(c.c.length).toBe(c.h.length);
      expect(c.h.length).toBe(c.l.length);
      expect(c.l.length).toBe(c.o.length);
      expect(c.o.length).toBe(c.v.length);
      expect(c.v.length).toBe(c.t.length);
      expect(c.t.length).toBeGreaterThan(0);
    }
  });

  it("candle numbers are realistic (prices > 0)", () => {
    for (const price of mockFinnhubCandleAAPL.c) {
      expect(price).toBeGreaterThan(0);
    }
    for (const vol of mockFinnhubCandleAAPL.v) {
      expect(vol).toBeGreaterThan(0);
    }
  });
});

// ── Finnhub news mocks ──────────────────────────────────────────────

describe("Finnhub news mock fixtures", () => {
  it("mockFinnhubNewsAAPL items satisfy FinnhubNewsItem shape", () => {
    for (const item of mockFinnhubNewsAAPL) {
      const news: FinnhubNewsItem = item;
      expect(news.id).toBeGreaterThan(0);
      expect(news.headline.length).toBeGreaterThan(0);
      expect(news.summary.length).toBeGreaterThan(0);
      expect(news.source.length).toBeGreaterThan(0);
      expect(news.url.length).toBeGreaterThan(0);
      expect(news.datetime).toBeGreaterThan(0);
    }
  });

  it("mockFinnhubNewsTSLA items satisfy FinnhubNewsItem shape", () => {
    for (const item of mockFinnhubNewsTSLA) {
      const news: FinnhubNewsItem = item;
      expect(news.related).toBe("TSLA");
      expect(news.headline).toContain("Tesla");
    }
  });

  it("mockFinnhubNewsEmpty is empty", () => {
    expect(mockFinnhubNewsEmpty).toHaveLength(0);
  });
});

// ── Derived data consistency ────────────────────────────────────────

describe("derived OhlcvPoint from candle mocks", () => {
  it("maps mockFinnhubCandleAAPL to 5 OhlcvPoints", () => {
    const points: OhlcvPoint[] = mockFinnhubCandleAAPL.t.map((ts, i) => ({
      timestamp: ts,
      open: mockFinnhubCandleAAPL.o[i],
      high: mockFinnhubCandleAAPL.h[i],
      low: mockFinnhubCandleAAPL.l[i],
      close: mockFinnhubCandleAAPL.c[i],
      volume: mockFinnhubCandleAAPL.v[i],
    }));
    expect(points).toHaveLength(5);
    for (const pt of points) {
      expect(pt.open).toBeGreaterThan(0);
      expect(pt.high).toBeGreaterThanOrEqual(pt.low);
    }
  });

  it("empty candle maps to empty OhlcvPoint array", () => {
    const points: OhlcvPoint[] = mockFinnhubCandleEmpty.t.map((_, i) => ({
      timestamp: mockFinnhubCandleEmpty.t[i],
      open: mockFinnhubCandleEmpty.o[i],
      high: mockFinnhubCandleEmpty.h[i],
      low: mockFinnhubCandleEmpty.l[i],
      close: mockFinnhubCandleEmpty.c[i],
      volume: mockFinnhubCandleEmpty.v[i],
    }));
    expect(points).toHaveLength(0);
  });
});
