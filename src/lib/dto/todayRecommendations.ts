import { z } from "zod";
import { recommendationCardOutputSchema } from "./recommendationCard";
import { riskModeSchema } from "./saveRiskProfile";

export const todayRecommendationsStatusEnum = z.enum(["ok", "no_call"]);

export const todayRecommendationsOkSchema = z.object({
  status: z.literal("ok"),
  selectedRiskMode: riskModeSchema,
  cards: z
    .array(recommendationCardOutputSchema)
    .min(1)
    .max(9),
});

export const todayRecommendationsNoCallSchema = z.object({
  status: z.literal("no_call"),
  reason: z.string().min(1).max(160),
});

export const todayRecommendationsResponseSchema = z.discriminatedUnion(
  "status",
  [todayRecommendationsOkSchema, todayRecommendationsNoCallSchema],
);

export type TodayRecommendationsResponse = z.infer<
  typeof todayRecommendationsResponseSchema
>;
export type TodayRecommendationsOk = z.infer<
  typeof todayRecommendationsOkSchema
>;
export type TodayRecommendationsNoCall = z.infer<
  typeof todayRecommendationsNoCallSchema
>;
