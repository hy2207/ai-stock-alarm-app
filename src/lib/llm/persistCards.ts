import type { LlmVariantCard } from "@/lib/dto/llmOutput";
import {
  recommendationCardCreateSchema,
  type RecommendationCardCreateInput,
} from "@/lib/dto/recommendationCard";
import { prisma } from "@/lib/prisma";

export interface PersistCardsInput {
  userId: string;
  variants: LlmVariantCard[];
}

export interface PersistCardsResultOk {
  ok: true;
  count: number;
}

export interface PersistCardsResultError {
  ok: false;
  count: number;
  error: string;
}

export type PersistCardsResult = PersistCardsResultOk | PersistCardsResultError;

/**
 * Persist LLM-generated card variants to the database.
 *
 * Each variant is validated against recommendationCardCreateSchema
 * (which enforces entry/target price constraints), then saved via
 * prisma.recommendationCard.createMany.
 *
 * Returns the number of successfully created records.
 */
export async function persistCards(
  input: PersistCardsInput,
): Promise<PersistCardsResult> {
  const creates: RecommendationCardCreateInput[] = [];

  for (const v of input.variants) {
    const now = new Date();
    const validUntil = new Date(now.getTime() + v.holdDays * 86_400_000);

    const parsed = recommendationCardCreateSchema.safeParse({
      userId: input.userId,
      ticker: v.ticker,
      direction: v.direction,
      entryPrice: v.entryPrice ?? null,
      entryRangeLow: v.entryRangeLow ?? null,
      entryRangeHigh: v.entryRangeHigh ?? null,
      targetPrice: v.targetPrice ?? null,
      targetRangeLow: v.targetRangeLow ?? null,
      targetRangeHigh: v.targetRangeHigh ?? null,
      stopPrice: v.stopPrice ?? null,
      holdDays: v.holdDays,
      confidenceScore: v.confidenceMode,
      reasonLine: v.reasonLine,
      status: "published",
      validUntil,
    });

    if (parsed.success) {
      creates.push(parsed.data);
    }
  }

  if (creates.length === 0) {
    return { ok: false, count: 0, error: "No valid card data to persist" };
  }

  try {
    await prisma.recommendationCard.createMany({ data: creates });
    return { ok: true, count: creates.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return { ok: false, count: 0, error: message };
  }
}
