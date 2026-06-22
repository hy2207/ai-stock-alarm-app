import { z } from "zod";

/** Each card variant the LLM generates — one per confidence mode. */
const llmCardSchema = z.object({
  ticker: z.string().min(1).max(10),
  direction: z.enum(["BUY", "SELL"]),
  entryPrice: z.number().positive().nullable().optional(),
  entryRangeLow: z.number().positive().nullable().optional(),
  entryRangeHigh: z.number().positive().nullable().optional(),
  targetPrice: z.number().positive().nullable().optional(),
  targetRangeLow: z.number().positive().nullable().optional(),
  targetRangeHigh: z.number().positive().nullable().optional(),
  stopPrice: z.number().positive().nullable().optional(),
  holdDays: z.number().int().min(1).max(10),
  reasonLine: z.string().trim().min(1).max(160),
});

/** LLM generates 3 card variants in one call. */
const llmVariantCardSchema = llmCardSchema.extend({
  confidenceMode: z.enum(["aggressive", "balanced", "conservative"]),
});

export const llmOkResponseSchema = z.object({
  status: z.literal("ok"),
  variants: z.array(llmVariantCardSchema).length(3),
});

export const llmNoCallResponseSchema = z.object({
  status: z.literal("no_call"),
  reason: z.string().min(1).max(160),
});

/** Discriminated union for the full LLM Structured Output. */
export const llmResponseSchema = z.discriminatedUnion("status", [
  llmOkResponseSchema,
  llmNoCallResponseSchema,
]);

export type LlmCardVariant = z.infer<typeof llmVariantCardSchema>;
export type LlmOkResponse = z.infer<typeof llmOkResponseSchema>;
export type LlmNoCallResponse = z.infer<typeof llmNoCallResponseSchema>;
export type LlmResponse = z.infer<typeof llmResponseSchema>;
