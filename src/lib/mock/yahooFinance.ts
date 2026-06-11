export const mockYahooChartResponseAAPL = {
  chart: {
    result: [
      {
        meta: {
          currency: "USD",
          symbol: "AAPL",
          regularMarketPrice: 182.5,
          previousClose: 181.2,
          gmtOffset: -14400,
        },
        timestamp: [
          1716854400, 1716940800, 1717027200, 1717113600, 1717200000,
        ],
        indicators: {
          quote: [
            {
              open: [180.1, 181.3, 182.0, 181.7, 182.8],
              high: [182.4, 183.1, 183.5, 182.9, 184.2],
              low: [179.8, 180.5, 181.2, 181.0, 182.1],
              close: [181.5, 182.2, 182.8, 182.3, 183.9],
              volume: [52000000, 48000000, 55000000, 51000000, 53000000],
            },
          ],
        },
      },
    ],
    error: null,
  },
};

export const mockYahooChartResponseTSLA = {
  chart: {
    result: [
      {
        meta: {
          currency: "USD",
          symbol: "TSLA",
          regularMarketPrice: 245.0,
          previousClose: 242.1,
          gmtOffset: -14400,
        },
        timestamp: [
          1716854400, 1716940800, 1717027200, 1717113600, 1717200000,
        ],
        indicators: {
          quote: [
            {
              open: [242.0, 243.5, 244.8, 243.2, 245.5],
              high: [245.2, 246.0, 247.1, 245.8, 247.3],
              low: [241.1, 242.2, 243.5, 242.8, 244.0],
              close: [243.8, 244.5, 245.2, 244.1, 246.8],
              volume: [89000000, 92000000, 87000000, 95000000, 91000000],
            },
          ],
        },
      },
    ],
    error: null,
  },
};

export const mockYahooChartResponseEmpty = {
  chart: { result: [], error: null },
};

/** Quote response for a single ticker */
export const mockYahooQuoteResponseAAPL = {
  quoteResponse: {
    result: [
      {
        symbol: "AAPL",
        regularMarketPrice: 182.5,
        regularMarketChangePercent: 0.72,
        marketCap: 2800000000000,
        fiftyTwoWeekHigh: 199.6,
        fiftyTwoWeekLow: 164.1,
      },
    ],
    error: null,
  },
};

export const mockYahooQuoteResponseError = {
  quoteResponse: {
    result: [],
    error: {
      code: "NOT_FOUND",
      description: "No data found for ticker INVALID",
    },
  },
};

/** Rate-limit error response from Yahoo Finance. */
export const mockYahooRateLimitError = {
  chart: { result: null, error: { code: "Too Many Requests", description: "Rate limit exceeded" } },
};

/** Chart API error response (e.g. ticker not found). */
export const mockYahooChartNotFound = {
  chart: { result: null, error: { code: "Not Found", description: "No data found, symbol may be delisted" } },
};
