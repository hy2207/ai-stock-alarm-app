import { z } from "zod";

export const riskModeSchema = z.enum(["aggressive", "balanced", "conservative"]);

export type RiskMode = z.infer<typeof riskModeSchema>;

/** Zod schema for `saveRiskProfile()` Server Action input.
 *
 *  Only riskMode is accepted from the client.  userId is injected
 *  server-side from the session. */
export const saveRiskProfileInputSchema = z.object({
  riskMode: riskModeSchema,
}).strict();

export type SaveRiskProfileInput = z.infer<typeof saveRiskProfileInputSchema>;
