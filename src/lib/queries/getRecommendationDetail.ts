import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { recommendationDetailSchema } from "@/lib/dto/recommendationDetail";
import type { RecommendationDetail } from "@/lib/dto/recommendationDetail";

/**
 * Fetch a single recommendation with evidence and performance history.
 *
 * Returns undefined when the card is not found or does not belong to
 * the authenticated user (prevents user-id enumeration).
 */
export async function getRecommendationDetail(
  recId: string,
): Promise<RecommendationDetail | undefined> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return undefined;
  }

  const card = await prisma.recommendationCard.findFirst({
    where: {
      id: recId,
      userId,
    },
    include: {
      evidenceSnapshots: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      performanceRecords: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!card) {
    return undefined;
  }

  return recommendationDetailSchema.parse({
    card: card,
    evidence: card.evidenceSnapshots[0] ?? null,
    performance: card.performanceRecords,
  });
}
