import type {
  MarketDataResult,
  MarketDataResultOrError,
  NewsArticle,
} from "./types";

/** Finnhub candle API response shape. */
export interface FinnhubCandleResponse {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  v: number[];
  t: number[];
  s: "ok" | "no_data";
}

/** Finnhub news API response shape. */
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

const FINNHUB_BASE = "https://finnhub.io/api/v1";

/**
 * Fetch OHLCV candle data for a ticker from Finnhub.
 * Uses Next.js fetch with a 1-hour revalidation window.
 */
export async function fetchFinnhubCandle(
  ticker: string,
  token: string,
): Promise<MarketDataResultOrError<MarketDataResult>> {
  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - 5 * 86400;
    const url = `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(ticker)}&resolution=D&from=${from}&to=${to}&token=${encodeURIComponent(token)}`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return {
        ok: false,
        error: { code: "HTTP_ERROR", message: `Finnhub returned ${res.status}` },
      };
    }

    const json: FinnhubCandleResponse = await res.json();

    if (json.s === "no_data" || !json.c.length) {
      return {
        ok: false,
        error: { code: "NO_DATA", message: `No candle data for ${ticker}` },
      };
    }

    const ohlcv = json.t.map((ts, i) => ({
      timestamp: ts,
      open: json.o[i],
      high: json.h[i],
      low: json.l[i],
      close: json.c[i],
      volume: json.v[i],
    }));

    return {
      ok: true,
      data: {
        ticker,
        regularMarketPrice: json.c[json.c.length - 1],
        previousClose: json.c.length > 1 ? json.c[json.c.length - 2] : json.c[0],
        ohlcv,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      ok: false,
      error: { code: "FETCH_ERROR", message },
    };
  }
}

/**
 * Fetch latest news articles for a ticker from Finnhub.
 * Uses Next.js fetch with a 30-minute revalidation window.
 */
export async function fetchFinnhubNews(
  ticker: string,
  token: string,
): Promise<MarketDataResultOrError<NewsArticle[]>> {
  try {
    const url = `${FINNHUB_BASE}/company-news?symbol=${encodeURIComponent(ticker)}&from=${_daysAgo(3)}&to=${_today()}&token=${encodeURIComponent(token)}`;
    const res = await fetch(url, {
      next: { revalidate: 1800 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return {
        ok: false,
        error: { code: "HTTP_ERROR", message: `Finnhub news returned ${res.status}` },
      };
    }

    const json: FinnhubNewsItem[] = await res.json();

    if (!Array.isArray(json)) {
      return {
        ok: false,
        error: { code: "INVALID_RESPONSE", message: "Finnhub news returned non-array" },
      };
    }

    const articles: NewsArticle[] = json.map((item) => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      datetime: item.datetime,
    }));

    return { ok: true, data: articles };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      ok: false,
      error: { code: "FETCH_ERROR", message },
    };
  }
}

function _daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function _today(): string {
  return new Date().toISOString().slice(0, 10);
}
