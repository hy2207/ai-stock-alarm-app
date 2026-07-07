import { z } from "zod";

/** Shape of each news item stored in the newsItems Json field. */
export const newsItemKoSchema = z.object({
  source: z.string(),
  headlineKo: z.string(),
  summaryKo: z.string(),
  publishedAt: z.string().optional(),
  url: z.string().optional(),
});
export type NewsItemKo = z.infer<typeof newsItemKoSchema>;

/** Safely parse the raw Prisma Json value into a typed array. */
export function parseNewsItems(raw: unknown): NewsItemKo[] {
  if (!raw) return [];
  const result = z.array(newsItemKoSchema).safeParse(raw);
  return result.success ? result.data : [];
}

/** Shape of the statistical forecast stored in the quantForecast Json field.
 *  Mirrors PriceForecast in src/lib/quant/forecastPrice.ts. */
export const quantForecastSchema = z.object({
  expectedPrice: z.number().positive(),
  lowBand: z.number(),
  highBand: z.number(),
  trendSlopePctPerDay: z.number(),
  trendR2: z.number().min(0).max(1),
  dailyVolatilityPct: z.number().min(0),
  horizonDays: z.number().int().min(1),
  method: z.string(),
});
export type QuantForecast = z.infer<typeof quantForecastSchema>;

/** Safely parse the raw Prisma Json value into a typed forecast. */
export function parseQuantForecast(raw: unknown): QuantForecast | null {
  if (!raw) return null;
  const result = quantForecastSchema.safeParse(raw);
  return result.success ? result.data : null;
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

/** Zod schema for validating RecommendationCard create payloads.
 *  entryPrice and targetPrice are required (point prices only).
 */
export const recommendationCardCreateSchema = z
  .object({
    userId: z.string().cuid(),
    ticker: z.string().min(1).max(10),
    direction: directionEnum,
    currentPrice: z.number().positive().nullable().optional(),
    entryPrice: z.number().positive().nullable().optional(),
    targetPrice: z.number().positive().nullable().optional(),
    exitPrice: z.number().positive().nullable().optional(),
    holdDays: z.number().int().min(1).max(10),
    confidenceScore: confidenceModeEnum,
    reasonLine: z.string().trim().min(1).max(160),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newsItems: z.any().nullable().optional(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    quantForecast: z.any().nullable().optional(),
    status: cardStatusEnum,
    validUntil: z.date(),
  })
  .refine((data) => data.entryPrice != null, {
    message: "entryPrice must be provided",
    path: ["entryPrice"],
  })
  .refine((data) => data.targetPrice != null, {
    message: "targetPrice must be provided",
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
  targetPrice: z.number().nullable(),
  exitPrice: z.number().nullable(),
  holdDays: z.number().int().min(1).max(10),
  confidenceScore: confidenceModeEnum,
  reasonLine: z.string().min(1).max(160),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newsItems: z.any().nullable().optional().default(null),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quantForecast: z.any().nullable().optional().default(null),
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
