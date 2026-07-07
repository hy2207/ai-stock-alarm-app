import { prisma } from "@/lib/prisma";

/**
 * Read-only view over ForecastTrustRecord for the archive page.
 * Records are produced by the daily 08:00 KST cron — nothing is
 * recomputed or fetched from market APIs here.
 */

export interface M7TrustRecordView {
  id: string;
  ticker: string;
  targetDate: string; // "YYYY-MM-DD"
  predicted: number;
  bandLow: number;
  bandHigh: number;
  actualClose: number | null;
  errorPct: number | null; // signed
  inBand: boolean | null;
}

export interface M7TickerStat {
  ticker: string;
  evaluated: number;
  hits: number;
  hitRatePct: number;
}

export interface M7TrustSummary {
  evaluatedCount: number;
  pendingCount: number;
  avgAbsErrorPct: number | null;
  bandHitRatePct: number | null;
  byTicker: M7TickerStat[];
}

export interface M7TrustView {
  summary: M7TrustSummary;
  records: M7TrustRecordView[];
}

const LOOKBACK_DAYS = 60;
const MAX_RECORDS = 250;

export function computeM7Summary(records: M7TrustRecordView[]): M7TrustSummary {
  const evaluated = records.filter((r) => r.inBand != null);
  const pending = records.filter((r) => r.inBand == null);
  const hits = evaluated.filter((r) => r.inBand === true);

  const absErrors = evaluated
    .filter((r) => r.errorPct != null)
    .map((r) => Math.abs(r.errorPct!));
  const avgAbsErrorPct =
    absErrors.length > 0
      ? Math.round((absErrors.reduce((a, b) => a + b, 0) / absErrors.length) * 10) / 10
      : null;

  const tickerMap = new Map<string, { evaluated: number; hits: number }>();
  for (const r of evaluated) {
    const s = tickerMap.get(r.ticker) ?? { evaluated: 0, hits: 0 };
    s.evaluated++;
    if (r.inBand === true) s.hits++;
    tickerMap.set(r.ticker, s);
  }

  const byTicker: M7TickerStat[] = Array.from(tickerMap.entries())
    .map(([ticker, s]) => ({
      ticker,
      evaluated: s.evaluated,
      hits: s.hits,
      hitRatePct: Math.round((s.hits / s.evaluated) * 100),
    }))
    .sort((a, b) => a.ticker.localeCompare(b.ticker));

  return {
    evaluatedCount: evaluated.length,
    pendingCount: pending.length,
    avgAbsErrorPct,
    bandHitRatePct:
      evaluated.length > 0
        ? Math.round((hits.length / evaluated.length) * 100)
        : null,
    byTicker,
  };
}

export async function getM7TrustView(): Promise<M7TrustView> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - LOOKBACK_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const rows = await prisma.forecastTrustRecord.findMany({
    where: { targetDate: { gte: cutoffStr } },
    orderBy: [{ targetDate: "desc" }, { ticker: "asc" }],
    take: MAX_RECORDS,
  });

  const records: M7TrustRecordView[] = rows.map((r) => ({
    id: r.id,
    ticker: r.ticker,
    targetDate: r.targetDate,
    predicted: r.predicted,
    bandLow: r.bandLow,
    bandHigh: r.bandHigh,
    actualClose: r.actualClose,
    errorPct: r.errorPct,
    inBand: r.inBand,
  }));

  return { summary: computeM7Summary(records), records };
}
