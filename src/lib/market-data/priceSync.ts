import { fetchYahooChart, fetchYahooChartByPeriod } from "./yahooFinance";
import {
  upsertPriceHistory,
  getStoredPriceHistory,
  getLatestStoredDate,
  type StoredPricePoint,
} from "./storePriceHistory";

export interface PriceSyncResult {
  ohlcv: StoredPricePoint[];
  regularMarketPrice: number | null;
  regularMarketTime: number | null;
}

/** Today's date in Eastern Time ("YYYY-MM-DD"). US stock market timezone. */
function todayET(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

/**
 * Ensure the DB has up-to-date price history for a ticker, then return it.
 *
 * Decision logic:
 *   - No data in DB          → fetch 1-month initial load from Yahoo
 *   - Last stored date < today (gap exists) → fetch only the missing
 *     range using period1/period2 (handles multi-day absences)
 *     If gap > 30 days, falls back to fresh 1-month load.
 *   - Last stored date = today → DB is current; skip Yahoo OHLCV fetch
 *
 * In all cases, the live regularMarketPrice + regularMarketTime are fetched
 * from Yahoo "5d" when we didn't already get them from a sync fetch.
 */
export async function syncPriceHistory(ticker: string): Promise<PriceSyncResult> {
  const latestDate = await getLatestStoredDate(ticker);
  const today = todayET();

  let regularMarketPrice: number | null = null;
  let regularMarketTime: number | null = null;

  if (!latestDate) {
    // ── No data: initial 1-month load ───────────────────────────────
    const result = await fetchYahooChart(ticker, "1mo");
    if (result.ok) {
      await upsertPriceHistory(ticker, result.data.ohlcv);
      regularMarketPrice = result.data.regularMarketPrice;
      regularMarketTime = result.data.regularMarketTime ?? null;
    }
  } else if (latestDate < today) {
    // ── Gap exists: fetch only the missing trading days ─────────────
    const daysDiff = Math.round(
      (Date.now() - new Date(`${latestDate}T00:00:00Z`).getTime()) / 86_400_000,
    );

    const result =
      daysDiff > 30
        ? await fetchYahooChart(ticker, "1mo")
        : await fetchYahooChartByPeriod(
            ticker,
            Math.floor(new Date(`${latestDate}T00:00:00Z`).getTime() / 1000),
            Math.floor(Date.now() / 1000),
          );

    if (result.ok) {
      await upsertPriceHistory(ticker, result.data.ohlcv);
      regularMarketPrice = result.data.regularMarketPrice;
      regularMarketTime = result.data.regularMarketTime ?? null;
    }
  }
  // else: latestDate === today → DB is current, no OHLCV fetch needed

  // Always resolve live price (may not have been set above for same-day hits)
  if (regularMarketPrice === null) {
    const live = await fetchYahooChart(ticker, "5d").catch(() => null);
    if (live?.ok) {
      regularMarketPrice = live.data.regularMarketPrice;
      regularMarketTime = live.data.regularMarketTime ?? null;
    }
  }

  const ohlcv = await getStoredPriceHistory(ticker, 35);
  return { ohlcv, regularMarketPrice, regularMarketTime };
}
