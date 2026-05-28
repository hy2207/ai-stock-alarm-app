import { z } from "zod";

const predictedDirectionEnum = z.enum(["BUY", "SELL"]);

/** Zod schema for validating PerformanceRecord create payloads. */
export const performanceRecordCreateSchema = z.object({
  recId: z.string().cuid(),
  ticker: z.string().min(1).max(10),
  predictedDirection: predictedDirectionEnum,
  realizedReturn: z.number().nullable().optional(),
  hitFlag: z.boolean().nullable().optional(),
  evaluationWindowDays: z.number().int().min(1).max(365),
  evaluatedAt: z.date().nullable().optional(),
});

export type PerformanceRecordCreateInput = z.infer<
  typeof performanceRecordCreateSchema
>;

/** Zod schema matching the full Prisma PerformanceRecord model. */
export const performanceRecordSchema = z.object({
  id: z.string().cuid(),
  recId: z.string().cuid(),
  ticker: z.string(),
  predictedDirection: predictedDirectionEnum,
  realizedReturn: z.number().nullable(),
  hitFlag: z.boolean().nullable(),
  evaluationWindowDays: z.number().int().min(1).max(365),
  evaluatedAt: z.date().nullable(),
  createdAt: z.date(),
});

export type PerformanceRecord = z.infer<typeof performanceRecordSchema>;
