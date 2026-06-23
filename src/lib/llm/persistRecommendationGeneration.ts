import { prisma } from "@/lib/prisma";
import type { RecommendationCard as PrismaRecommendationCard } from "@prisma/client";
import {
  recommendationCardCreateSchema,
} from "@/lib/dto/recommendationCard";
import {
  evidenceSnapshotCreateSchema,
  type EvidenceSnapshotCreateInput,
} from "@/lib/dto/evidenceSnapshot";
import type { RecommendationGeneration } from "./generateRecommendationCards";

interface PersistRecommendationGenerationInput {
  userId: string;
  generation: RecommendationGeneration;
  evidence?: Omit<EvidenceSnapshotCreateInput, "recId">;
  now?: Date;
}

function validUntilFromHoldDays(now: Date, holdDays: number): Date {
  const validUntil = new Date(now);
  validUntil.setUTCDate(validUntil.getUTCDate() + holdDays);
  return validUntil;
}

export async function persistRecommendationGeneration({
  userId,
  generation,
  evidence,
  now = new Date(),
}: PersistRecommendationGenerationInput): Promise<PrismaRecommendationCard[]> {
  if (generation.status === "no_call") {
    return [];
  }

  return prisma.$transaction(
    generation.variants.map((variant) => {
      const cardData = recommendationCardCreateSchema.parse({
        userId,
        ticker: variant.ticker,
        direction: variant.direction,
        currentPrice: variant.currentPrice,
        entryPrice: variant.entryPrice ?? null,
        entryRangeLow: variant.entryRangeLow ?? null,
        entryRangeHigh: variant.entryRangeHigh ?? null,
        targetPrice: variant.targetPrice ?? null,
        targetRangeLow: variant.targetRangeLow ?? null,
        targetRangeHigh: variant.targetRangeHigh ?? null,
        stopPrice: variant.stopPrice ?? null,
        holdDays: variant.holdDays,
        confidenceScore: variant.confidenceMode,
        reasonLine: variant.reasonLine,
        newsRationaleKo: variant.newsRationaleKo,
        status: "published",
        validUntil: validUntilFromHoldDays(now, variant.holdDays),
      });

      const evidenceData = evidence
        ? evidenceSnapshotCreateSchema
            .omit({ recId: true })
            .parse(evidence)
        : undefined;

      return prisma.recommendationCard.create({
        data: {
          ...cardData,
          evidenceSnapshots: evidenceData
            ? {
                create: evidenceData,
              }
            : undefined,
        },
      });
    }),
  );
}
