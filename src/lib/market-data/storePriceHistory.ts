import { prisma } from "@/lib/prisma";
import type { OhlcvPoint } from "./types";

export interface StoredPricePoint {
  date: string;  // "2024-06-25"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: bigint | null;
}

function tsToDate(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

function round2(n: number | null | undefined): number {
  if (n == null || !isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

/** Upsert a batch of OHLCV points for a ticker into the DB. */
export async function upsertPriceHistory(
  ticker: string,
  ohlcv: OhlcvPoint[],
): Promise<void> {
  const validPoints = ohlcv.filter(
    (p) => p.close != null && isFinite(p.close) && p.timestamp > 0,
  );

  if (validPoints.length === 0) return;

  // Batch upserts sequentially to avoid connection pool exhaustion
  for (const p of validPoints) {
    const date = tsToDate(p.timestamp);
    await prisma.tickerPriceHistory.upsert({
      where: { ticker_date: { ticker, date } },
      create: {
        ticker,
        date,
        open: round2(p.open),
        high: round2(p.high),
        low: round2(p.low),
        close: round2(p.close),
        volume: p.volume != null ? BigInt(Math.round(p.volume)) : null,
      },
      update: {
        open: round2(p.open),
        high: round2(p.high),
        low: round2(p.low),
        close: round2(p.close),
        volume: p.volume != null ? BigInt(Math.round(p.volume)) : null,
      },
    });
  }
}

/** Fetch stored price history for a ticker (up to `days` calendar days back). */
export async function getStoredPriceHistory(
  ticker: string,
  days = 35,
): Promise<StoredPricePoint[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const rows = await prisma.tickerPriceHistory.findMany({
    where: { ticker, date: { gte: cutoffStr } },
    orderBy: { date: "asc" },
  });

  return rows.map((r) => ({
    date: r.date,
    open: r.open,
    high: r.high,
    low: r.low,
    close: r.close,
    volume: r.volume,
  }));
}

/**
 * Fetch stored OHLCV for a ticker within an inclusive date range.
 * Used by the performance evaluator to retrieve hold-window candles.
 */
export async function getStoredPriceHistoryByRange(
  ticker: string,
  startDate: string,
  endDate: string,
): Promise<StoredPricePoint[]> {
  const rows = await prisma.tickerPriceHistory.findMany({
    where: { ticker, date: { gte: startDate, lte: endDate } },
    orderBy: { date: "asc" },
  });
  return rows.map((r) => ({
    date: r.date,
    open: r.open,
    high: r.high,
    low: r.low,
    close: r.close,
    volume: r.volume,
  }));
}

/**
 * Returns the most recent stored date string ("YYYY-MM-DD") for a ticker,
 * or null if no records exist.
 */
export async function getLatestStoredDate(ticker: string): Promise<string | null> {
  const row = await prisma.tickerPriceHistory.findFirst({
    where: { ticker },
    orderBy: { date: "desc" },
    select: { date: true },
  });
  return row?.date ?? null;
}
