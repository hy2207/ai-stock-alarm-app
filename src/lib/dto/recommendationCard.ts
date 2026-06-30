import { z } from "zod";

/** Shape of each news item stored in the newsItems Json field. */
export const newsItemKoSchema = z.object({
  source: z.string(),
  headlineKo: z.string(),
  summaryKo: z.string(),
  publishedAt: z.string().optional(),
});
export type NewsItemKo = z.infer<typeof newsItemKoSchema>;

/** Safely parse the raw Prisma Json value into a typed array. */
export function parseNewsItems(raw: unknown): NewsItemKo[] {
  if (!raw) return [];
  const result = z.array(newsItemKoSchema).safeParse(raw);
  return result.success ? result.data : [];
}

export const directionEnum = z.enum(["BUY", "SELL"]);
export const confidenceModeEnum = z.enum([
  "aggressive",
  "balanced",
  "conservative",
]);
export const cardStatusEnum = z.enum([
  "published",
  "no_call",
  "validation_failed",
]);

function atLeastOne(field1: string, field2: string) {
  return (data: Record<string, unknown>) =>
    data[field1] != null || data[field2] != null;
}

function atLeastOneOf(...fields: string[]) {
  return (data: Record<string, unknown>) =>
    fields.some((f) => data[f] != null);
}

function entryOrRange(data: {
  entryPrice?: number | null;
  entryRangeLow?: number | null;
  entryRangeHigh?: number | null;
}) {
  if (data.entryPrice != null) return true;
  if (data.entryRangeLow != null || data.entryRangeHigh != null) {
    return data.entryRangeLow != null && data.entryRangeHigh != null;
  }
  return false;
}

function targetOrRange(data: {
  targetPrice?: number | null;
  targetRangeLow?: number | null;
  targetRangeHigh?: number | null;
}) {
  if (data.targetPrice != null) return true;
  if (data.targetRangeLow != null || data.targetRangeHigh != null) {
    return data.targetRangeLow != null && data.targetRangeHigh != null;
  }
  return false;
}

/** Zod schema for validating RecommendationCard create payloads.
 *
 *  At least one of entryPrice / entryRangeLow / entryRangeHigh must be set.
 *  At least one of targetPrice / targetRangeLow / targetRangeHigh must be set.
 */
export const recommendationCardCreateSchema = z
  .object({
    userId: z.string().cuid(),
    ticker: z.string().min(1).max(10),
    direction: directionEnum,
    currentPrice: z.number().positive().nullable().optional(),
    entryPrice: z.number().positive().nullable().optional(),
    entryRangeLow: z.number().positive().nullable().optional(),
    entryRangeHigh: z.number().positive().nullable().optional(),
    targetPrice: z.number().positive().nullable().optional(),
    targetRangeLow: z.number().positive().nullable().optional(),
    targetRangeHigh: z.number().positive().nullable().optional(),
    exitPrice: z.number().positive().nullable().optional(),
    holdDays: z.number().int().min(1).max(10),
    confidenceScore: confidenceModeEnum,
    reasonLine: z.string().trim().min(1).max(160),
    newsRationaleKo: z.string().trim().min(1).max(240).nullable().optional(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newsItems: z.any().nullable().optional(),
    status: cardStatusEnum,
    validUntil: z.date(),
  })
  .refine(entryOrRange, {
    message:
      "At least one of entryPrice, entryRangeLow, or entryRangeHigh must be provided",
    path: ["entryPrice"],
  })
  .refine(targetOrRange, {
    message:
      "At least one of targetPrice, targetRangeLow, or targetRangeHigh must be provided",
    path: ["targetPrice"],
  });

export type RecommendationCardCreateInput = z.infer<
  typeof recommendationCardCreateSchema
>;

/** Zod schema matching the full Prisma RecommendationCard model. */
export const recommendationCardSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  ticker: z.string(),
  direction: directionEnum,
  currentPrice: z.number().positive().nullable().optional().default(null),
  entryPrice: z.number().nullable(),
  entryRangeLow: z.number().nullable(),
  entryRangeHigh: z.number().nullable(),
  targetPrice: z.number().nullable(),
  targetRangeLow: z.number().nullable(),
  targetRangeHigh: z.number().nullable(),
  exitPrice: z.number().nullable(),
  holdDays: z.number().int().min(1).max(10),
  confidenceScore: confidenceModeEnum,
  reasonLine: z.string().min(1).max(160),
  newsRationaleKo: z.string().min(1).max(240).nullable().optional().default(null),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newsItems: z.any().nullable().optional().default(null),
  status: cardStatusEnum,
  createdAt: z.date(),
  validUntil: z.date(),
});

export type RecommendationCard = z.infer<typeof recommendationCardSchema>;

/** Zod schema for client-facing API response output.
 *  Excludes internal `userId`; includes all presentation-relevant fields. */
export const recommendationCardOutputSchema = recommendationCardSchema.omit({
  userId: true,
});

export type RecommendationCardOutput = z.infer<
  typeof recommendationCardOutputSchema
>;
