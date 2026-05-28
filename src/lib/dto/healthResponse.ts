import { z } from "zod";

/** Per-source freshness value in minutes since last successful collection.
 *  null means the source has never been successfully queried. */
const sourceFreshnessSchema = z.number().int().nonnegative().nullable();

/** Response DTO for GET /api/admin/health.
 *
 *  freshness: per-source minutes since last data update (null = never collected)
 *  nullRate:  percentage of null/missing data across recent observations (0–100)
 */
export const healthResponseSchema = z.object({
  freshness: z.object({
    yahooFinance: sourceFreshnessSchema,
    finnhub: sourceFreshnessSchema,
  }),
  nullRate: z.number().min(0).max(100),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
