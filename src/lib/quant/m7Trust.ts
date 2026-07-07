import { prisma } from "@/lib/prisma";
import { syncPriceHistory } from "@/lib/market-data/priceSync";
import { getStoredPriceHistory } from "@/lib/market-data/storePriceHistory";
import { forecastPrice } from "./forecastPrice";
import { backtestForecast } from "./backtestForecast";

/**
 * Program-level trust records: every day at 08:00 KST (after US close) a
 * 1-day forecast for each M7 ticker is snapshotted to the DB, and the
 * previous snapshot is graded against the actual close. The archive page
 * reads these records only from the DB — nothing is recomputed per view.
 */

export const M7_TICKERS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "META",
  "TSLA",
] as const;

export interface M7UpdateSummary {
  backfilled: number;
  evaluated: number;
  forecasted: number;
  cleaned: number;
  errors: string[];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Signed % gap between actual and predicted close. */
export function signedErrorPct(predicted: number, actual: number): number {
  return round2(((actual - predicted) / predicted) * 100);
}

/** Next trading day ("YYYY-MM-DD", weekends skipped) after an ET date. */
export function nextTradingDateAfter(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  do {
    d.setUTCDate(d.getUTCDate() + 1);
  } while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
  return d.toISOString().slice(0, 10);
}

/**
 * Daily M7 trust update. Runs sequentially — the pgBouncer serverless pool
 * allows a single connection.
 */
export async function runM7ForecastUpdate(): Promise<M7UpdateSummary> {
  const summary: M7UpdateSummary = {
    backfilled: 0,
    evaluated: 0,
    forecasted: 0,
    cleaned: 0,
    errors: [],
  };

  for (const ticker of M7_TICKERS) {
    try {
      await syncPriceHistory(ticker);
    } catch (err) {
      summary.errors.push(
        `${ticker}: price sync failed — ${err instanceof Error ? err.message : String(err)}`,
      );
      // Continue with whatever the DB already has
    }

    const history = await getStoredPriceHistory(ticker, 150);
    if (history.length === 0) {
      summary.errors.push(`${ticker}: no stored price history`);
      continue;
    }

    const closeByDate = new Map(history.map((p) => [p.date, p.close]));
    const latestDate = history[history.length - 1].date;

    // ── 1. One-time backfill from the walk-forward backtest ────────────────
    const existing = await prisma.forecastTrustRecord.count({ where: { ticker } });
    if (existing === 0) {
      const bt = backtestForecast(
        history.map((p) => ({ date: p.date, close: p.close })),
      );
      if (bt) {
        for (const p of bt.points) {
          await prisma.forecastTrustRecord.create({
            data: {
              ticker,
              targetDate: p.date,
              predicted: p.predicted,
              bandLow: p.bandLow,
              bandHigh: p.bandHigh,
              actualClose: p.actual,
              errorPct: signedErrorPct(p.predicted, p.actual),
              inBand: p.inBand,
              evaluatedAt: new Date(),
            },
          });
          summary.backfilled++;
        }
      }
    }

    // ── 2. Grade pending snapshots against actual closes ───────────────────
    const pending = await prisma.forecastTrustRecord.findMany({
      where: { ticker, actualClose: null },
    });

    for (const record of pending) {
      const actual = closeByDate.get(record.targetDate);

      if (actual != null) {
        await prisma.forecastTrustRecord.update({
          where: { id: record.id },
          data: {
            actualClose: actual,
            errorPct: signedErrorPct(record.predicted, actual),
            inBand: actual >= record.bandLow && actual <= record.bandHigh,
            evaluatedAt: new Date(),
          },
        });
        summary.evaluated++;
      } else if (record.targetDate < latestDate) {
        // Predicted day turned out to be a market holiday — drop the record
        await prisma.forecastTrustRecord.delete({ where: { id: record.id } });
        summary.cleaned++;
      }
    }

    // ── 3. Snapshot a forecast for the next trading day ────────────────────
    const forecast = forecastPrice(history.map((p) => p.close), 1);
    if (!forecast) {
      summary.errors.push(`${ticker}: not enough data to forecast`);
      continue;
    }

    const targetDate = nextTradingDateAfter(latestDate);
    const already = await prisma.forecastTrustRecord.findUnique({
      where: { ticker_targetDate: { ticker, targetDate } },
    });
    if (!already) {
      await prisma.forecastTrustRecord.create({
        data: {
          ticker,
          targetDate,
          predicted: forecast.expectedPrice,
          bandLow: forecast.lowBand,
          bandHigh: forecast.highBand,
        },
      });
      summary.forecasted++;
    }
  }

  return summary;
}
