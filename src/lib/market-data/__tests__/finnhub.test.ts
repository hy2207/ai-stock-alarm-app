import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockFinnhubCandleAAPL } from "../../mock/finnhub";
import type { FinnhubCandleResponse } from "../finnhub";

const FINNHUB_TOKEN = "test_token_123";

import { fetchFinnhubCandle, fetchFinnhubNews } from "../finnhub";

const mockCandleOk: FinnhubCandleResponse = {
  ...mockFinnhubCandleAAPL,
};

interface FinnhubNewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  category: string;
  related: string;
  image: string;
}

const mockNewsOk: FinnhubNewsItem[] = [
  {
    id: 1001,
    headline: "Apple Reports Strong Q2 Earnings",
    summary: "Apple exceeded analyst expectations",
    source: "Financial Times",
    url: "https://example.com/news/1001",
    datetime: 1716854400,
    category: "technology",
    related: "AAPL",
    image: "https://example.com/img.jpg",
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("fetchFinnhubCandle", () => {
  it("returns normalized data on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockCandleOk), { status: 200 }),
    );
    const result = await fetchFinnhubCandle("AAPL", FINNHUB_TOKEN);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.ticker).toBe("AAPL");
      expect(result.data.ohlcv).toHaveLength(5);
      expect(result.data.regularMarketPrice).toBe(
        mockCandleOk.c[mockCandleOk.c.length - 1],
      );
    }
  });

  it("returns error on no_data status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ c: [], h: [], l: [], o: [], v: [], t: [], s: "no_data" }),
        { status: 200 },
      ),
    );
    const result = await fetchFinnhubCandle("UNKNOWN", FINNHUB_TOKEN);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NO_DATA");
    }
  });

  it("returns error on HTTP failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 429 }),
    );
    const result = await fetchFinnhubCandle("AAPL", FINNHUB_TOKEN);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("HTTP_ERROR");
    }
  });

  it("returns error on fetch exception", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network failure"));
    const result = await fetchFinnhubCandle("AAPL", FINNHUB_TOKEN);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("FETCH_ERROR");
    }
  });
});

describe("fetchFinnhubNews", () => {
  it("returns normalized news articles on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockNewsOk), { status: 200 }),
    );
    const result = await fetchFinnhubNews("AAPL", FINNHUB_TOKEN);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].headline).toContain("Apple");
      expect(result.data[0].url).toMatch(/^https?:\/\//);
    }
  });

  it("returns empty array when no news", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );
    const result = await fetchFinnhubNews("AAPL", FINNHUB_TOKEN);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toHaveLength(0);
    }
  });

  it("returns error on HTTP failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );
    const result = await fetchFinnhubNews("AAPL", FINNHUB_TOKEN);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("HTTP_ERROR");
    }
  });
});
