import { prisma } from "@/lib/prisma";
import { syncPriceHistory } from "@/lib/market-data/priceSync";
import {
  getStoredPriceHistoryByRange,
  upsertPriceHistory,
  type StoredPricePoint,
} from "@/lib/market-data/storePriceHistory";
import { fetchYahooChartByPeriod } from "@/lib/market-data/yahooFinance";
import type { EvaluatePerformanceResponse } from "@/lib/dto/evaluatePerformanceResponse";

interface PendingRecord {
  id: string;
  ticker: string;
  predictedDirection: string;
  evaluationWindowDays: number;
  createdAt: Date;
  recommendationCard: {
    entryPrice: number | null;
    targetPrice: number | null;
  };
}

/**
 * Pure: evaluate a completed hold window using daily OHLCV candles.
 *
 * Success criteria (no brokerage needed — purely market-data based):
 *   BUY  → any candle where high  >= targetPrice → hit, return = (target-entry)/entry
 *   SELL → any candle where low   <= targetPrice → hit, return = (entry-target)/entry
 *   No target → hitFlag follows sign of realizedReturn at expiry.
 *   On miss → realizedReturn uses the last close in the hold window.
 */
export function computeEvaluationFromOhlcv(
  direction: string,
  entryPrice: number,
  targetPrice: number | null,
  candles: StoredPricePoint[],
): { realizedReturn: number; hitFlag: boolean } {
  const isBuy = direction === "BUY";

  // Check if target was touched during the hold window
  let targetTouched = false;
  if (targetPrice != null) {
    for (const c of candles) {
      if (isBuy ? c.high >= targetPrice : c.low <= targetPrice) {
        targetTouched = true;
        break;
      }
    }
  }

  let realizedReturn: number;
  let hitFlag: boolean;

  if (targetTouched && targetPrice != null) {
    // Return is locked in at target price (best-case fill assumption)
    hitFlag = true;
    realizedReturn = isBuy
      ? ((targetPrice - entryPrice) / entryPrice) * 100
      : ((entryPrice - targetPrice) / entryPrice) * 100;
  } else {
    // Use closing price on the last day of the hold window
    const lastClose = candles.length > 0 ? candles[candles.length - 1].close : entryPrice;
    realizedReturn = isBuy
      ? ((lastClose - entryPrice) / entryPrice) * 100
      : ((entryPrice - lastClose) / entryPrice) * 100;
    // Without a target price, treat positive return as a hit
    hitFlag = targetPrice === null ? realizedReturn > 0 : false;
  }

  return {
    realizedReturn: Math.round(realizedReturn * 100) / 100,
    hitFlag,
  };
}

/** Convert a Date to an ET "YYYY-MM-DD" string. */
function toETDate(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

/** Derive the inclusive [startDate, endDate] strings for a card's hold window. */
function holdWindowDates(
  createdAt: Date,
  holdDays: number,
): { startDate: string; endDate: string } {
  const startDate = toETDate(createdAt);
  const end = new Date(createdAt);
  end.setDate(end.getDate() + holdDays);
  return { startDate, endDate: toETDate(end) };
}

/**
 * Return OHLCV candles for the hold window from DB.
 * Falls back to a targeted Yahoo Finance fetch if the DB has no data for that range.
 */
async function ensureOhlcvForWindow(
  ticker: string,
  startDate: string,
  endDate: string,
): Promise<StoredPricePoint[]> {
  let candles = await getStoredPriceHistoryByRange(ticker, startDate, endDate);
  if (candles.length > 0) return candles;

  // DB miss — fetch the specific window from Yahoo Finance and cache it
  const startTs = Math.floor(new Date(`${startDate}T13:30:00Z`).getTime() / 1000);
  const endTs = Math.floor(new Date(`${endDate}T22:00:00Z`).getTime() / 1000);
  const result = await fetchYahooChartByPeriod(ticker, startTs, endTs);

  if (result.ok && result.data.ohlcv.length > 0) {
    await upsertPriceHistory(ticker, result.data.ohlcv);
    candles = await getStoredPriceHistoryByRange(ticker, startDate, endDate);
  }

  return candles;
}

/** Returns PerformanceRecords whose hold window has expired and hitFlag is still null. */
async function loadPendingRecords(now: Date): Promise<PendingRecord[]> {
  const rows = await prisma.performanceRecord.findMany({
    where: { hitFlag: null },
    select: {
      id: true,
      ticker: true,
      predictedDirection: true,
      evaluationWindowDays: true,
      createdAt: true,
      recommendationCard: {
        select: { entryPrice: true, targetPrice: true },
      },
    },
  });

  return rows.filter((r) => {
    const expiresAt = new Date(r.createdAt);
    expiresAt.setUTCDate(expiresAt.getUTCDate() + r.evaluationWindowDays);
    return expiresAt <= now;
  });
}

export async function runPerformanceEvaluation(
  now = new Date(),
): Promise<EvaluatePerformanceResponse> {
  const pending = await loadPendingRecords(now);
  if (pending.length === 0) return { evaluated: 0, skipped: 0, errors: [] };

  // Ensure DB price history is current for all affected tickers
  const uniqueTickers = [...new Set(pending.map((r) => r.ticker))];
  await Promise.allSettled(uniqueTickers.map((t) => syncPriceHistory(t)));

  let evaluated = 0;
  let skipped = 0;
  const errors: string[] = [];

  await Promise.all(
    pending.map(async (record) => {
      const entryPrice = record.recommendationCard.entryPrice;
      if (entryPrice == null) {
        skipped++;
        return;
      }

      const { startDate, endDate } = holdWindowDates(
        record.createdAt,
        record.evaluationWindowDays,
      );

      let candles: StoredPricePoint[];
      try {
        candles = await ensureOhlcvForWindow(record.ticker, startDate, endDate);
      } catch (err) {
        errors.push(
          `${record.ticker}: fetch failed — ${err instanceof Error ? err.message : String(err)}`,
        );
        skipped++;
        return;
      }

      if (candles.length === 0) {
        errors.push(`${record.ticker}: no price data for ${startDate}–${endDate}`);
        skipped++;
        return;
      }

      const { realizedReturn, hitFlag } = computeEvaluationFromOhlcv(
        record.predictedDirection,
        entryPrice,
        record.recommendationCard.targetPrice,
        candles,
      );

      await prisma.performanceRecord.update({
        where: { id: record.id },
        data: { realizedReturn, hitFlag, evaluatedAt: now },
      });

      evaluated++;
    }),
  );

  return { evaluated, skipped, errors };
}
