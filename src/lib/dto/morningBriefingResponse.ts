import { z } from "zod";

/** Response DTO for GET /api/cron/morning-briefing.
 *
 *  scheduled: number of users targeted for push
 *  sent:      number of pushes successfully delivered to OneSignal
 *  failed:    number of pushes that failed on delivery
 */
export const morningBriefingResponseSchema = z.object({
  scheduled: z.number().int().nonnegative(),
  sent: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});

export type MorningBriefingResponse = z.infer<
  typeof morningBriefingResponseSchema
>;
