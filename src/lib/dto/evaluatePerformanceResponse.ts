import { z } from "zod";

export const evaluatePerformanceResponseSchema = z.object({
  evaluated: z.number().int().min(0),
  skipped: z.number().int().min(0),
  errors: z.array(z.string()),
});

export type EvaluatePerformanceResponse = z.infer<
  typeof evaluatePerformanceResponseSchema
>;
