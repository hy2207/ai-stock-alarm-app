import type {
  MarketDataResult,
  MarketDataResultOrError,
} from "./types";

/** Internal Yahoo Finance chart API response shape. */
interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        currency: string;
        symbol: string;
        regularMarketPrice: number;
        regularMarketTime?: number;
        previousClose: number;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: number[];
          high: number[];
          low: number[];
          close: number[];
          volume: number[];
        }>;
      };
    }>;
    error: { code: string; description: string } | null;
  };
}

const BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

async function parseYahooResponse(
  res: Response,
  ticker: string,
): Promise<MarketDataResultOrError<MarketDataResult>> {
  if (!res.ok) {
    return {
      ok: false,
      error: { code: "HTTP_ERROR", message: `Yahoo Finance returned ${res.status}` },
    };
  }

  const json: YahooChartResponse = await res.json();

  if (json.chart.error) {
    return {
      ok: false,
      error: { code: json.chart.error.code, message: json.chart.error.description },
    };
  }

  const result = json.chart.result[0];
  if (!result) {
    return {
      ok: false,
      error: { code: "NO_DATA", message: `No chart data for ${ticker}` },
    };
  }

  const quote = result.indicators.quote[0];
  const ohlcv = result.timestamp.map((ts, i) => ({
    timestamp: ts,
    open: quote.open[i],
    high: quote.high[i],
    low: quote.low[i],
    close: quote.close[i],
    volume: quote.volume[i],
  }));

  return {
    ok: true,
    data: {
      ticker: result.meta.symbol,
      regularMarketPrice: result.meta.regularMarketPrice,
      regularMarketTime: result.meta.regularMarketTime,
      previousClose: result.meta.previousClose,
      ohlcv,
    },
  };
}

/**
 * Fetch OHLCV chart data using a relative range (e.g. "1mo", "5d").
 * Cached for 1 hour — use for current-price lookups and initial loads.
 */
export async function fetchYahooChart(
  ticker: string,
  range: "5d" | "1mo" | "3mo" = "5d",
): Promise<MarketDataResultOrError<MarketDataResult>> {
  try {
    const url = `${BASE_URL}/${encodeURIComponent(ticker)}?range=${range}&interval=1d`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    return parseYahooResponse(res, ticker);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: { code: "FETCH_ERROR", message } };
  }
}

/**
 * Fetch OHLCV chart data for an absolute date range (Unix timestamps in seconds).
 * No cache — always fetches fresh data, used for gap-filling DB records.
 */
export async function fetchYahooChartByPeriod(
  ticker: string,
  period1: number,
  period2: number,
): Promise<MarketDataResultOrError<MarketDataResult>> {
  try {
    const url = `${BASE_URL}/${encodeURIComponent(ticker)}?period1=${period1}&period2=${period2}&interval=1d`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    return parseYahooResponse(res, ticker);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: { code: "FETCH_ERROR", message } };
  }
}
