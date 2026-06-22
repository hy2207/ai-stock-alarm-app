import { streamObject, type LanguageModel } from "ai";
import { z } from "zod";
import {
  confidenceModeEnum,
  directionEnum,
} from "@/lib/dto/recommendationCard";
import {
  buildRecommendationPrompt,
  type RecommendationPromptInput,
} from "./promptBuilder";
import { getGeminiModel } from "./gemini";
import { captureServerEvent } from "@/lib/analytics/serverCapture";

const FALLBACK_NO_CALL_REASON =
  "Recommendation generation is unavailable. Review the watchlist later.";
const LLM_GENERATION_TIMEOUT_MS = 25_000;

type LlmFailureReason =
  | "api_error"
  | "api_key"
  | "no_response"
  | "rate_limit"
  | "timeout"
  | "llm_call_failed";

function hasAnyPrice(...values: Array<number | null | undefined>) {
  return values.some((value) => value != null);
}

function readErrorStatus(error: unknown) {
  if (typeof error !== "object" || error == null) {
    return null;
  }

  const status = "status" in error ? error.status : null;
  if (typeof status === "number") {
    return status;
  }

  const code = "code" in error ? error.code : null;
  if (typeof code === "number") {
    return code;
  }

  return null;
}

function readErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error != null && "message" in error) {
    const message = error.message;
    return typeof message === "string" ? message : String(message);
  }

  if (typeof error === "string") {
    return error;
  }

  return String(error);
}

export function classifyLlmCallFailure(error: unknown): {
  reason: LlmFailureReason;
  status: number | null;
} {
  const status = readErrorStatus(error);
  const message = readErrorMessage(error).toLowerCase();
  const name = error instanceof Error ? error.name.toLowerCase() : "";

  if (
    status === 429 ||
    message.includes("429") ||
    message.includes("rate limit") ||
    message.includes("quota")
  ) {
    return { reason: "rate_limit", status };
  }

  if (
    name === "aborterror" ||
    name === "timeouterror" ||
    message.includes("timeout") ||
    message.includes("timed out")
  ) {
    return { reason: "timeout", status };
  }

  if (
    status === 401 ||
    status === 403 ||
    message.includes("401") ||
    message.includes("403") ||
    message.includes("api key") ||
    message.includes("permission denied") ||
    message.includes("unauthorized")
  ) {
    return { reason: "api_key", status };
  }

  if (
    message.includes("empty response") ||
    message.includes("no response")
  ) {
    return { reason: "no_response", status };
  }

  if (
    (status != null && status >= 500) ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("internal server error") ||
    message.includes("bad gateway") ||
    message.includes("service unavailable")
  ) {
    return { reason: "api_error", status };
  }

  return { reason: "llm_call_failed", status };
}

export const recommendationGenerationVariantSchema = z
  .object({
    ticker: z.string().trim().min(1).max(10),
    direction: directionEnum,
    entryPrice: z.number().positive().nullable().optional(),
    entryRangeLow: z.number().positive().nullable().optional(),
    entryRangeHigh: z.number().positive().nullable().optional(),
    targetPrice: z.number().positive().nullable().optional(),
    targetRangeLow: z.number().positive().nullable().optional(),
    targetRangeHigh: z.number().positive().nullable().optional(),
    stopPrice: z.number().positive().nullable().optional(),
    holdDays: z.number().int().min(1).max(10),
    confidenceMode: confidenceModeEnum,
    reasonLine: z.string().trim().min(1).max(160),
  })
  .refine(
    (data) =>
      hasAnyPrice(data.entryPrice, data.entryRangeLow, data.entryRangeHigh),
    {
      message:
        "At least one of entryPrice, entryRangeLow, or entryRangeHigh must be provided",
      path: ["entryPrice"],
    },
  )
  .refine(
    (data) =>
      hasAnyPrice(data.targetPrice, data.targetRangeLow, data.targetRangeHigh),
    {
      message:
        "At least one of targetPrice, targetRangeLow, or targetRangeHigh must be provided",
      path: ["targetPrice"],
    },
  );

const requiredModes = new Set(["aggressive", "balanced", "conservative"]);

function includesEveryConfidenceMode(
  variants: Array<{ confidenceMode: string }>,
) {
  const presentModes = new Set(
    variants.map((variant) => variant.confidenceMode),
  );

  return [...requiredModes].every((mode) => presentModes.has(mode));
}

export const recommendationGenerationSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("ok"),
    variants: z
      .array(recommendationGenerationVariantSchema)
      .length(3)
      .refine(includesEveryConfidenceMode, {
        message:
          "Exactly one aggressive, balanced, and conservative variant is required",
      }),
  }),
  z.object({
    status: z.literal("no_call"),
    reason: z.string().trim().min(1).max(160),
  }),
]);

export type RecommendationGeneration = z.infer<
  typeof recommendationGenerationSchema
>;

export interface GenerateRecommendationCardsInput {
  promptInput: RecommendationPromptInput;
  model?: LanguageModel;
  stream?: typeof streamObject;
  captureEvent?: typeof captureServerEvent;
}

export async function generateRecommendationCards({
  promptInput,
  model,
  stream = streamObject,
  captureEvent = captureServerEvent,
}: GenerateRecommendationCardsInput): Promise<RecommendationGeneration> {
  if (promptInput.watchlist.length === 0) {
    return {
      status: "no_call",
      reason: "Watchlist is empty. Add at least one ticker before generating.",
    };
  }

  try {
    const prompt = buildRecommendationPrompt(promptInput);
    const modelToUse = model ?? getGeminiModel();
    const callStream = () =>
      stream({
        model: modelToUse,
        schema: recommendationGenerationSchema,
        schemaName: "RecommendationGeneration",
        schemaDescription:
          "Decision Layer recommendation output with exactly three confidence variants or No Call.",
        system: prompt.system,
        prompt: prompt.user,
        timeout: { totalMs: LLM_GENERATION_TIMEOUT_MS },
      });

    try {
      return recommendationGenerationSchema.parse(await callStream().object);
    } catch (error) {
      if (!(error instanceof z.ZodError)) {
        throw error;
      }
    }

    try {
      return recommendationGenerationSchema.parse(await callStream().object);
    } catch (error) {
      if (error instanceof z.ZodError) {
        await captureEvent("rec_validation_failed", {
          error: "structured_output_validation_failed",
          attempts: 2,
        });
        return {
          status: "no_call",
          reason: FALLBACK_NO_CALL_REASON,
        };
      }
      throw error;
    }
  } catch (error) {
    const failure = classifyLlmCallFailure(error);
    await captureEvent("llm_call_failed", {
      reason: failure.reason,
      status: failure.status,
    });

    return {
      status: "no_call",
      reason: FALLBACK_NO_CALL_REASON,
    };
  }
}
