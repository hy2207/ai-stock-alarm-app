import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchYahooChart } from "../yahooFinance";

const mockOkResponse = {
  chart: {
    result: [
      {
        meta: {
          currency: "USD",
          symbol: "AAPL",
          regularMarketPrice: 182.5,
          previousClose: 181.2,
        },
        timestamp: [1716854400, 1716940800],
        indicators: {
          quote: [
            {
              open: [180.1, 181.3],
              high: [182.4, 183.1],
              low: [179.8, 180.5],
              close: [181.5, 182.2],
              volume: [52000000, 48000000],
            },
          ],
        },
      },
    ],
    error: null,
  },
};

const mockErrorResponse = {
  chart: { result: [], error: { code: "NOT_FOUND", description: "No data found" } },
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("fetchYahooChart", () => {
  it("returns normalized data on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockOkResponse), { status: 200 }),
    );
    const result = await fetchYahooChart("AAPL");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.ticker).toBe("AAPL");
      expect(result.data.regularMarketPrice).toBe(182.5);
      expect(result.data.previousClose).toBe(181.2);
      expect(result.data.ohlcv).toHaveLength(2);
      expect(result.data.ohlcv[0].open).toBe(180.1);
    }
  });

  it("returns error on HTTP failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 429 }),
    );
    const result = await fetchYahooChart("AAPL");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("HTTP_ERROR");
    }
  });

  it("returns error when API returns chart error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockErrorResponse), { status: 200 }),
    );
    const result = await fetchYahooChart("INVALID");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });

  it("returns error on fetch exception", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network failure"));
    const result = await fetchYahooChart("AAPL");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("FETCH_ERROR");
    }
  });
});
