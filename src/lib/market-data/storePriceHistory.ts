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
 * Returns true when we have a DB record dated today or the previous
 * 3 calendar days (weekends + holidays).
 */
export async function hasFreshPriceData(ticker: string): Promise<boolean> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 3);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const count = await prisma.tickerPriceHistory.count({
    where: { ticker, date: { gte: cutoffStr } },
  });
  return count > 0;
}
