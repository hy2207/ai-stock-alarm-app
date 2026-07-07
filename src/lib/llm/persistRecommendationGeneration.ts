import { prisma } from "@/lib/prisma";
import type { RecommendationCard as PrismaRecommendationCard } from "@prisma/client";
import {
  recommendationCardCreateSchema,
} from "@/lib/dto/recommendationCard";
import { forecastPrice } from "@/lib/quant/forecastPrice";
import type { RecommendationGeneration } from "./generateRecommendationCards";

interface PersistRecommendationGenerationInput {
  userId: string;
  generation: RecommendationGeneration;
  /** Daily closes (oldest → newest) for the generation's ticker.
   *  When provided, a statistical quantForecast is stored per variant. */
  closes?: number[];
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
  closes,
  now = new Date(),
}: PersistRecommendationGenerationInput): Promise<PrismaRecommendationCard[]> {
  if (generation.status === "no_call") {
    return [];
  }

  return prisma.$transaction(
    generation.variants.map((variant) => {
      const quantForecast = closes
        ? forecastPrice(closes, variant.holdDays)
        : null;

      const cardData = recommendationCardCreateSchema.parse({
        userId,
        ticker: variant.ticker,
        direction: variant.direction,
        currentPrice: variant.currentPrice,
        entryPrice: variant.entryPrice ?? null,
        targetPrice: variant.targetPrice ?? null,
        exitPrice: variant.exitPrice ?? null,
        holdDays: variant.holdDays,
        confidenceScore: variant.confidenceMode,
        reasonLine: variant.reasonLine,
        newsItems: variant.newsItems.length > 0 ? variant.newsItems : null,
        quantForecast,
        status: "published",
        validUntil: validUntilFromHoldDays(now, variant.holdDays),
      });

      return prisma.recommendationCard.create({
        data: {
          ...cardData,
          performanceRecords: {
            create: {
              ticker: cardData.ticker,
              predictedDirection: cardData.direction,
              evaluationWindowDays: cardData.holdDays,
            },
          },
        },
      });
    }),
  );
}
