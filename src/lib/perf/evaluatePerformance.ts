import { prisma } from "@/lib/prisma";
import { fetchYahooChart } from "@/lib/market-data/yahooFinance";
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

/** Pure: given prices and direction, compute realizedReturn and hitFlag. */
export function computeEvaluation(
  direction: string,
  entryPrice: number,
  currentPrice: number,
  targetPrice: number | null,
): { realizedReturn: number; hitFlag: boolean } {
  const isBuy = direction === "BUY";

  const realizedReturn = isBuy
    ? ((currentPrice - entryPrice) / entryPrice) * 100
    : ((entryPrice - currentPrice) / entryPrice) * 100;

  let hitFlag: boolean;
  if (targetPrice != null) {
    hitFlag = isBuy ? currentPrice >= targetPrice : currentPrice <= targetPrice;
  } else {
    hitFlag = realizedReturn > 0;
  }

  return { realizedReturn, hitFlag };
}

/** Returns records whose hold window has expired and are not yet evaluated. */
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

  if (pending.length === 0) {
    return { evaluated: 0, skipped: 0, errors: [] };
  }

  // Fetch market price once per ticker
  const tickers = [...new Set(pending.map((r) => r.ticker))];
  const priceMap = new Map<string, number>();
  const errors: string[] = [];

  await Promise.all(
    tickers.map(async (ticker) => {
      const result = await fetchYahooChart(ticker);
      if (result.ok) {
        priceMap.set(ticker, result.data.regularMarketPrice);
      } else {
        errors.push(`${ticker}: ${result.error.message}`);
      }
    }),
  );

  let evaluated = 0;
  let skipped = 0;

  await Promise.all(
    pending.map(async (record) => {
      const currentPrice = priceMap.get(record.ticker);
      const entryPrice = record.recommendationCard.entryPrice;

      if (currentPrice == null || entryPrice == null) {
        skipped++;
        return;
      }

      const { realizedReturn, hitFlag } = computeEvaluation(
        record.predictedDirection,
        entryPrice,
        currentPrice,
        record.recommendationCard.targetPrice,
      );

      await prisma.performanceRecord.update({
        where: { id: record.id },
        data: {
          realizedReturn: Math.round(realizedReturn * 100) / 100,
          hitFlag,
          evaluatedAt: now,
        },
      });

      evaluated++;
    }),
  );

  return { evaluated, skipped, errors };
}
