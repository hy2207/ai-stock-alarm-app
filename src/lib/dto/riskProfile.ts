import { z } from "zod";

const riskModeEnum = z.enum(["aggressive", "balanced", "conservative"]);

/** Zod schema for validating RiskProfile create / update payloads. */
export const riskProfileCreateSchema = z.object({
  userId: z.string().cuid(),
  riskMode: riskModeEnum,
}).strict();

export type RiskProfileCreateInput = z.infer<typeof riskProfileCreateSchema>;

/** Zod schema matching the full Prisma RiskProfile model (for output assertions). */
export const riskProfileSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  riskMode: riskModeEnum,
  updatedAt: z.date(),
});

export type RiskProfile = z.infer<typeof riskProfileSchema>;
