import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { recommendationCardOutputSchema } from "@/lib/dto/recommendationCard";
import type { TodayRecommendationsResponse } from "@/lib/dto/todayRecommendations";

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
export async function getTodayRecommendations(): Promise<TodayRecommendationsResponse> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { status: "no_call", reason: "Sign in to see your daily recommendations" };
  }

  const cards = await prisma.recommendationCard.findMany({
    where: {
      userId,
      status: "published",
      createdAt: {
        gte: todayStart(),
        lt: tomorrowStart(),
      },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  if (cards.length === 0) {
    return { status: "no_call", reason: "No recommendations available today. Check back tomorrow morning." };
  }

  return {
    status: "ok",
    cards: cards.map((c) => recommendationCardOutputSchema.parse(c)),
  };
}
