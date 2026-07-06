import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { recommendationCardOutputSchema } from "@/lib/dto/recommendationCard";
import type { TodayRecommendationsResponse } from "@/lib/dto/todayRecommendations";
import type { RiskMode } from "@/lib/dto/saveRiskProfile";

/** Start of the current calendar day (00:00:00.000 UTC). */
function todayStart(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Start of the next calendar day (00:00:00.000 UTC). */
function tomorrowStart(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

/**
 * Fetch today's published recommendation cards for the authenticated user.
 *
 * - Returns `{ status: "ok", cards: RecommendationCardOutput[] }` when cards exist.
 * - Returns `{ status: "no_call", reason: string }` when no cards for today.
 * - Returns `{ status: "no_call", reason: string }` when unauthenticated.
 *
 * Max 3 cards are returned, ordered by creation time descending.
 */
export async function getTodayRecommendations(
  resolvedUserId?: string,
): Promise<TodayRecommendationsResponse> {
  const userId = resolvedUserId ?? (await getCurrentUserId());

  if (!userId) {
    return { status: "no_call", reason: "Sign in to see your daily recommendations" };
  }

  const [riskProfile, cards] = await Promise.all([
    prisma.riskProfile.findUnique({ where: { userId } }),
    prisma.recommendationCard.findMany({
      where: {
        userId,
        status: "published",
        createdAt: {
          gte: todayStart(),
          lt: tomorrowStart(),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 9,
    }),
  ]);

  // Any published card for today is served as-is. Regeneration only happens
  // when today's cards are deleted (e.g. resetTodayCards after a watchlist
  // change), which sends the home page into the no_call → auto-load path.
  if (cards.length === 0) {
    return { status: "no_call", reason: "No recommendations available today. Check back tomorrow morning." };
  }

  const selectedRiskMode: RiskMode =
    riskProfile?.riskMode === "aggressive" ||
    riskProfile?.riskMode === "balanced" ||
    riskProfile?.riskMode === "conservative"
      ? riskProfile.riskMode
      : "balanced";

  return {
    status: "ok",
    selectedRiskMode,
    cards: cards.map((c) => recommendationCardOutputSchema.parse(c)),
  };
}
