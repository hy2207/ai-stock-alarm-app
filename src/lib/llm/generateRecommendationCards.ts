import { streamObject, type LanguageModel } from "ai";
import { z } from "zod";
import {
  confidenceModeEnum,
  directionEnum,
} from "@/lib/dto/recommendationCard";
import {
  buildRecommendationPrompt,
  type RecommendationPromptInput,
} from "./promptBuilder";
import { getGeminiModel } from "./gemini";

const FALLBACK_NO_CALL_REASON =
  "Recommendation generation is unavailable. Review the watchlist later.";

function hasAnyPrice(...values: Array<number | null | undefined>) {
  return values.some((value) => value != null);
}

export const recommendationGenerationVariantSchema = z
  .object({
    ticker: z.string().trim().min(1).max(10),
    direction: directionEnum,
    entryPrice: z.number().positive().nullable().optional(),
    entryRangeLow: z.number().positive().nullable().optional(),
    entryRangeHigh: z.number().positive().nullable().optional(),
    targetPrice: z.number().positive().nullable().optional(),
    targetRangeLow: z.number().positive().nullable().optional(),
    targetRangeHigh: z.number().positive().nullable().optional(),
    stopPrice: z.number().positive().nullable().optional(),
    holdDays: z.number().int().min(1).max(10),
    confidenceMode: confidenceModeEnum,
    reasonLine: z.string().trim().min(1).max(160),
  })
  .refine(
    (data) =>
      hasAnyPrice(data.entryPrice, data.entryRangeLow, data.entryRangeHigh),
    {
      message:
        "At least one of entryPrice, entryRangeLow, or entryRangeHigh must be provided",
      path: ["entryPrice"],
    },
  )
  .refine(
    (data) =>
      hasAnyPrice(data.targetPrice, data.targetRangeLow, data.targetRangeHigh),
    {
      message:
        "At least one of targetPrice, targetRangeLow, or targetRangeHigh must be provided",
      path: ["targetPrice"],
    },
  );

const requiredModes = new Set(["aggressive", "balanced", "conservative"]);

function includesEveryConfidenceMode(
  variants: Array<{ confidenceMode: string }>,
) {
  const presentModes = new Set(
    variants.map((variant) => variant.confidenceMode),
  );

  return [...requiredModes].every((mode) => presentModes.has(mode));
}

export const recommendationGenerationSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("ok"),
    variants: z
      .array(recommendationGenerationVariantSchema)
      .length(3)
      .refine(includesEveryConfidenceMode, {
        message:
          "Exactly one aggressive, balanced, and conservative variant is required",
      }),
  }),
  z.object({
    status: z.literal("no_call"),
    reason: z.string().trim().min(1).max(160),
  }),
]);

export type RecommendationGeneration = z.infer<
  typeof recommendationGenerationSchema
>;

export interface GenerateRecommendationCardsInput {
  promptInput: RecommendationPromptInput;
  model?: LanguageModel;
  stream?: typeof streamObject;
}

export async function generateRecommendationCards({
  promptInput,
  model,
  stream = streamObject,
}: GenerateRecommendationCardsInput): Promise<RecommendationGeneration> {
  if (promptInput.watchlist.length === 0) {
    return {
      status: "no_call",
      reason: "Watchlist is empty. Add at least one ticker before generating.",
    };
  }

  try {
    const prompt = buildRecommendationPrompt(promptInput);
    const result = stream({
      model: model ?? getGeminiModel(),
      schema: recommendationGenerationSchema,
      schemaName: "RecommendationGeneration",
      schemaDescription:
        "Decision Layer recommendation output with exactly three confidence variants or No Call.",
      system: prompt.system,
      prompt: prompt.user,
    });

    return recommendationGenerationSchema.parse(await result.object);
  } catch {
    return {
      status: "no_call",
      reason: FALLBACK_NO_CALL_REASON,
    };
  }
}
