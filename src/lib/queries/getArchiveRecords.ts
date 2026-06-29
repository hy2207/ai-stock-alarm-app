import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/getServerSession";

export interface CardSummary {
  direction: string;
  entryPrice: number | null;
  targetPrice: number | null;
  holdDays: number;
  createdAt: Date;
}

export interface ArchiveRecord {
  id: string;
  recId: string;
  ticker: string;
  predictedDirection: string;
  realizedReturn: number | null;
  hitFlag: boolean | null;
  evaluationWindowDays: number;
  evaluatedAt: Date | null;
  createdAt: Date;
  card: CardSummary;
}

export interface ArchiveResult {
  records: ArchiveRecord[];
  totalCount: number;
}

export async function getArchiveRecords(): Promise<ArchiveResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { records: [], totalCount: 0 };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [rows, totalCount] = await Promise.all([
    prisma.performanceRecord.findMany({
      where: {
        recommendationCard: { userId },
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        recommendationCard: {
          select: {
            direction: true,
            entryPrice: true,
            targetPrice: true,
            holdDays: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.performanceRecord.count({
      where: { recommendationCard: { userId } },
    }),
  ]);

  return {
    records: rows.map((r) => ({
      id: r.id,
      recId: r.recId,
      ticker: r.ticker,
      predictedDirection: r.predictedDirection,
      realizedReturn: r.realizedReturn,
      hitFlag: r.hitFlag,
      evaluationWindowDays: r.evaluationWindowDays,
      evaluatedAt: r.evaluatedAt,
      createdAt: r.createdAt,
      card: {
        direction: r.recommendationCard.direction,
        entryPrice: r.recommendationCard.entryPrice,
        targetPrice: r.recommendationCard.targetPrice,
        holdDays: r.recommendationCard.holdDays,
        createdAt: r.recommendationCard.createdAt,
      },
    })),
    totalCount,
  };
}
