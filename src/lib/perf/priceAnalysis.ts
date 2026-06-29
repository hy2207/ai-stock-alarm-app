import { fetchYahooChart } from "@/lib/market-data/yahooFinance";
import type { OhlcvPoint } from "@/lib/market-data/types";

export interface DailyPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  targetReached: boolean;
}

export interface PriceAnalysis {
  currentPrice: number;
  dailyPrices: DailyPrice[];
  targetReachedDate: string | null;
  gapToTargetPct: number | null;
}

function fmtDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function filterToHoldWindow(
  ohlcv: OhlcvPoint[],
  cardCreatedAt: Date,
  holdDays: number,
): OhlcvPoint[] {
  // Start = midnight on the card creation date (local)
  const startMs = new Date(cardCreatedAt.toDateString()).getTime();
  const endMs = startMs + holdDays * 24 * 60 * 60 * 1000;
  const filtered = ohlcv.filter(
    (p) => p.timestamp * 1000 >= startMs && p.timestamp * 1000 <= endMs,
  );
  // Fall back to last holdDays candles if window filter returns nothing
  return filtered.length > 0 ? filtered : ohlcv.slice(-holdDays);
}

function isTargetReached(candle: OhlcvPoint, direction: string, targetPrice: number): boolean {
  return direction === "BUY" ? candle.high >= targetPrice : candle.low <= targetPrice;
}

export async function analyzePriceForRecord(
  ticker: string,
  direction: string,
  targetPrice: number | null,
  cardCreatedAt: Date,
  holdDays: number,
): Promise<PriceAnalysis | null> {
  const result = await fetchYahooChart(ticker);
  if (!result.ok) return null;

  const { regularMarketPrice, ohlcv } = result.data;
  const candles = filterToHoldWindow(ohlcv, cardCreatedAt, holdDays);

  let targetReachedDate: string | null = null;
  const dailyPrices: DailyPrice[] = candles.map((p) => {
    const reached = targetPrice != null && isTargetReached(p, direction, targetPrice);
    if (reached && targetReachedDate === null) {
      targetReachedDate = fmtDate(p.timestamp);
    }
    return {
      date: fmtDate(p.timestamp),
      open: round2(p.open ?? 0),
      high: round2(p.high ?? 0),
      low: round2(p.low ?? 0),
      close: round2(p.close ?? 0),
      targetReached: reached,
    };
  });

  let gapToTargetPct: number | null = null;
  if (targetPrice != null) {
    const gap =
      direction === "BUY"
        ? ((targetPrice - regularMarketPrice) / regularMarketPrice) * 100
        : ((regularMarketPrice - targetPrice) / regularMarketPrice) * 100;
    gapToTargetPct = round2(gap);
  }

  return {
    currentPrice: round2(regularMarketPrice),
    dailyPrices,
    targetReachedDate,
    gapToTargetPct,
  };
}

export type TickerAnalysisMap = Map<string, PriceAnalysis | null>;

export async function buildTickerAnalysisMap(
  tickers: string[],
  getCardInfo: (ticker: string) => { direction: string; targetPrice: number | null; holdDays: number; createdAt: Date },
): Promise<TickerAnalysisMap> {
  const map = new Map<string, PriceAnalysis | null>();
  await Promise.all(
    tickers.map(async (ticker) => {
      const info = getCardInfo(ticker);
      const analysis = await analyzePriceForRecord(
        ticker,
        info.direction,
        info.targetPrice,
        info.createdAt,
        info.holdDays,
      );
      map.set(ticker, analysis);
    }),
  );
  return map;
}
