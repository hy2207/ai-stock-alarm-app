import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { recommendationCardOutputSchema } from "@/lib/dto/recommendationCard";
import type { RecommendationCardOutput } from "@/lib/dto/recommendationCard";

export interface TickerHistoryItem extends RecommendationCardOutput {
  hitFlag: boolean | null;
  realizedReturn: number | null;
}

export interface TickerHistoryResult {
  items: TickerHistoryItem[];
  totalCount: number;
}

/**
 * Fetch past recommendation results for a given ticker.
 *
 * Returns RecommendationCards with their PerformanceRecord summary fields
 * (hitFlag, realizedReturn), newest first. Only returns cards owned by
 * the authenticated user.
 *
 * Returns an empty list when the user is unauthenticated or no records exist.
 */
export async function getTickerHistory(
  ticker: string,
): Promise<TickerHistoryResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { items: [], totalCount: 0 };
  }

  const [cards, totalCount] = await Promise.all([
    prisma.recommendationCard.findMany({
      where: {
        userId,
        ticker: ticker.toUpperCase(),
      },
      include: {
        performanceRecords: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.recommendationCard.count({
      where: {
        userId,
        ticker: ticker.toUpperCase(),
      },
    }),
  ]);

  return {
    items: cards.map((c) => {
      const parsed = recommendationCardOutputSchema.parse(c);
      const perf = c.performanceRecords[0];
      return {
        ...parsed,
        hitFlag: perf?.hitFlag ?? null,
        realizedReturn: perf?.realizedReturn ?? null,
      };
    }),
    totalCount,
  };
}
