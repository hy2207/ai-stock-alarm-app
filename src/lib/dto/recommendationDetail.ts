import { z } from "zod";
import { recommendationCardOutputSchema } from "./recommendationCard";
import { performanceRecordSchema } from "./performanceRecord";

/** Zod schema for the GET /api/recommendations/[recId] detail response.
 *
 *  Includes the recommendation card and performance history.
 *  All fields are client-facing — internal fields (userId) are
 *  excluded from the card.
 */
export const recommendationDetailSchema = z.object({
  card: recommendationCardOutputSchema,
  performance: z.array(performanceRecordSchema),
});

export type RecommendationDetail = z.infer<typeof recommendationDetailSchema>;
