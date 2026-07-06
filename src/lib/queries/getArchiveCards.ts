import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/getServerSession";

export interface ArchiveCard {
  id: string;
  ticker: string;
  direction: string;
  entryPrice: number | null;
  targetPrice: number | null;
  exitPrice: number | null;
  holdDays: number;
  confidenceScore: string;
  reasonLine: string;
  createdAt: Date;
  performance: {
    realizedReturn: number | null;
    hitFlag: boolean | null;
    evaluatedAt: Date | null;
  } | null;
}

export interface TickerStat {
  ticker: string;
  total: number;
  wins: number;
  avgReturn: number | null;
}

export interface ArchiveStats {
  total: number;
  evaluated: number;
  wins: number;
  losses: number;
  pendingCount: number;
  successRate: number | null;
  avgReturn: number | null;
  byTicker: TickerStat[];
}

export function computeStats(cards: ArchiveCard[]): ArchiveStats {
  const evaluated = cards.filter((c) => c.performance?.hitFlag != null);
  const wins = evaluated.filter((c) => c.performance?.hitFlag === true);
  const losses = evaluated.filter((c) => c.performance?.hitFlag === false);
  const pending = cards.filter((c) => c.performance?.hitFlag == null);

  const successRate =
    evaluated.length > 0 ? Math.round((wins.length / evaluated.length) * 100) : null;

  const returnsWithValue = evaluated.filter((c) => c.performance?.realizedReturn != null);
  const avgReturn =
    returnsWithValue.length > 0
      ? returnsWithValue.reduce((sum, c) => sum + c.performance!.realizedReturn!, 0) /
        returnsWithValue.length
      : null;

  const tickerMap = new Map<string, { total: number; wins: number; returns: number[] }>();
  for (const card of cards) {
    const s = tickerMap.get(card.ticker) ?? { total: 0, wins: 0, returns: [] };
    s.total++;
    if (card.performance?.hitFlag === true) s.wins++;
    if (card.performance?.realizedReturn != null) s.returns.push(card.performance.realizedReturn);
    tickerMap.set(card.ticker, s);
  }

  const byTicker: TickerStat[] = Array.from(tickerMap.entries())
    .map(([ticker, s]) => ({
      ticker,
      total: s.total,
      wins: s.wins,
      avgReturn:
        s.returns.length > 0 ? s.returns.reduce((a, b) => a + b, 0) / s.returns.length : null,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    total: cards.length,
    evaluated: evaluated.length,
    wins: wins.length,
    losses: losses.length,
    pendingCount: pending.length,
    successRate,
    avgReturn,
    byTicker,
  };
}

export async function getArchiveCards(): Promise<ArchiveCard[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const rows = await prisma.recommendationCard.findMany({
    where: { userId, status: "published" },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      ticker: true,
      direction: true,
      entryPrice: true,
      targetPrice: true,
      exitPrice: true,
      holdDays: true,
      confidenceScore: true,
      reasonLine: true,
      createdAt: true,
      performanceRecords: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          realizedReturn: true,
          hitFlag: true,
          evaluatedAt: true,
        },
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    ticker: r.ticker,
    direction: r.direction,
    entryPrice: r.entryPrice,
    targetPrice: r.targetPrice,
    exitPrice: r.exitPrice,
    holdDays: r.holdDays,
    confidenceScore: r.confidenceScore as string,
    reasonLine: r.reasonLine,
    createdAt: r.createdAt,
    performance: r.performanceRecords[0] ?? null,
  }));
}
