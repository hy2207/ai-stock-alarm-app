import { generateText, type LanguageModel } from "ai";
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
const GEMINI_PROVIDER_OPTIONS = {
  google: {
    thinkingConfig: {
      thinkingLevel: "minimal",
      includeThoughts: false,
    },
  },
} as const;

class LlmGenerationTimeoutError extends Error {
  constructor() {
    super(`Gemini request timed out after ${LLM_GENERATION_TIMEOUT_MS}ms`);
    this.name = "TimeoutError";
  }
}

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

function readTargetPrice(data: {
  targetPrice?: number | null;
  targetRangeLow?: number | null;
  targetRangeHigh?: number | null;
}) {
  if (data.targetPrice != null) {
    return data.targetPrice;
  }
  if (data.targetRangeLow != null && data.targetRangeHigh != null) {
    return (data.targetRangeLow + data.targetRangeHigh) / 2;
  }
  return null;
}

function hasDirectionalTarget(data: {
  direction: "BUY" | "SELL";
  currentPrice: number;
  targetPrice?: number | null;
  targetRangeLow?: number | null;
  targetRangeHigh?: number | null;
}) {
  const target = readTargetPrice(data);
  if (target == null) {
    return false;
  }
  if (data.direction === "BUY") {
    return target > data.currentPrice;
  }
  return target < data.currentPrice;
}

function isSamePrice(a: number, b: number) {
  return Math.abs(a - b) < 0.01;
}

function sharesOneConsensusTarget(
  variants: Array<{
    ticker: string;
    direction: string;
    currentPrice: number;
    targetPrice?: number | null;
    targetRangeLow?: number | null;
    targetRangeHigh?: number | null;
  }>,
) {
  const [first] = variants;
  if (!first) {
    return false;
  }

  const firstTarget = readTargetPrice(first);
  if (firstTarget == null) {
    return false;
  }

  return variants.every((variant) => {
    const target = readTargetPrice(variant);
    return (
      variant.ticker === first.ticker &&
      variant.direction === first.direction &&
      isSamePrice(variant.currentPrice, first.currentPrice) &&
      target != null &&
      isSamePrice(target, firstTarget)
    );
  });
}

function hasRiskOrderedStops(
  variants: Array<{
    direction: "BUY" | "SELL";
    confidenceMode: "aggressive" | "balanced" | "conservative";
    targetPrice?: number | null;
    targetRangeLow?: number | null;
    targetRangeHigh?: number | null;
    stopPrice: number;
  }>,
) {
  const aggressive = variants.find(
    (variant) => variant.confidenceMode === "aggressive",
  );
  const balanced = variants.find(
    (variant) => variant.confidenceMode === "balanced",
  );
  const conservative = variants.find(
    (variant) => variant.confidenceMode === "conservative",
  );

  const target = aggressive ? readTargetPrice(aggressive) : null;
  if (!aggressive || !balanced || !conservative || target == null) {
    return false;
  }

  return (
    aggressive.stopPrice > balanced.stopPrice &&
    balanced.stopPrice > conservative.stopPrice &&
    (aggressive.direction === "BUY" ? aggressive.stopPrice >= target * 0.98 : true)
  );
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

function getNoCallReasonForLlmFailure(reason: LlmFailureReason) {
  switch (reason) {
    case "timeout":
      return "Gemini recommendation generation timed out. Try again or use a faster GEMINI_MODEL.";
    case "api_key":
      return "Gemini API key or model access is invalid. Check GEMINI_API_KEY and GEMINI_MODEL.";
    case "rate_limit":
      return "Gemini quota or rate limit was reached. Try again after the quota resets.";
    case "api_error":
      return "Gemini service returned an error. Try generating again later.";
    case "no_response":
      return "Gemini returned an empty response. Try generating again.";
    case "llm_call_failed":
      return FALLBACK_NO_CALL_REASON;
  }
}

function parseJsonObject(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("empty response from model");
  }

  const fencedJson = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fencedJson?.[1] ?? trimmed;
  return JSON.parse(candidate);
}

export const recommendationGenerationVariantSchema = z
  .object({
    ticker: z.string().trim().min(1).max(10),
    direction: directionEnum,
    currentPrice: z.number().positive(),
    entryPrice: z.number().positive().nullable().optional(),
    entryRangeLow: z.number().positive().nullable().optional(),
    entryRangeHigh: z.number().positive().nullable().optional(),
    targetPrice: z.number().positive().nullable().optional(),
    targetRangeLow: z.number().positive().nullable().optional(),
    targetRangeHigh: z.number().positive().nullable().optional(),
    stopPrice: z.number().positive(),
    holdDays: z.number().int().min(1).max(10),
    confidenceMode: confidenceModeEnum,
    reasonLine: z.string().trim().min(1).max(160),
    newsRationaleKo: z.string().trim().min(1).max(240),
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
  )
  .refine(hasDirectionalTarget, {
    message:
      "BUY requires target above currentPrice; SELL requires target below currentPrice",
    path: ["targetPrice"],
  });

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
      })
      .refine(sharesOneConsensusTarget, {
        message:
          "All confidence variants for a ticker must share the same direction, currentPrice, and consensus targetPrice",
      })
      .refine(hasRiskOrderedStops, {
        message:
          "stopPrice must be aggressive > balanced > conservative for both BUY and SELL; BUY aggressive stopPrice must be near/above target",
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
  generate?: typeof generateText;
  captureEvent?: typeof captureServerEvent;
}

export async function generateRecommendationCards({
  promptInput,
  model,
  generate = generateText,
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
    const callGenerate = (abortSignal: AbortSignal) =>
      generate({
        model: modelToUse,
        system: prompt.system,
        prompt: `${prompt.user}

Return only valid JSON. Do not wrap it in Markdown.
Use one of these shapes:
{"status":"ok","variants":[{"ticker":"AAPL","direction":"BUY","currentPrice":100,"entryPrice":100,"targetPrice":110,"stopPrice":114,"holdDays":5,"confidenceMode":"aggressive","reasonLine":"한국어 한 줄 근거 160자 이하","newsRationaleKo":"뉴스 근거를 한국어 240자 이하로 요약"},{"ticker":"AAPL","direction":"BUY","currentPrice":100,"entryPrice":100,"targetPrice":110,"stopPrice":108,"holdDays":5,"confidenceMode":"balanced","reasonLine":"한국어 한 줄 근거 160자 이하","newsRationaleKo":"뉴스 근거를 한국어 240자 이하로 요약"},{"ticker":"AAPL","direction":"BUY","currentPrice":100,"entryPrice":100,"targetPrice":110,"stopPrice":102,"holdDays":5,"confidenceMode":"conservative","reasonLine":"한국어 한 줄 근거 160자 이하","newsRationaleKo":"뉴스 근거를 한국어 240자 이하로 요약"}]}
{"status":"no_call","reason":"160 chars max"}`,
        abortSignal,
        temperature: 0.2,
        maxOutputTokens: 1_600,
        providerOptions: GEMINI_PROVIDER_OPTIONS,
        timeout: { totalMs: LLM_GENERATION_TIMEOUT_MS },
      });
    const readObject = async () => {
      const controller = new AbortController();
      let timeoutId: ReturnType<typeof setTimeout>;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          reject(new LlmGenerationTimeoutError());
        }, LLM_GENERATION_TIMEOUT_MS);
      });

      try {
        const result = await Promise.race([
          callGenerate(controller.signal),
          timeoutPromise,
        ]);
        return parseJsonObject(result.text);
      } finally {
        clearTimeout(timeoutId!);
      }
    };

    try {
      return recommendationGenerationSchema.parse(await readObject());
    } catch (error) {
      if (!(error instanceof z.ZodError)) {
        throw error;
      }
    }

    try {
      return recommendationGenerationSchema.parse(await readObject());
    } catch (error) {
      if (error instanceof z.ZodError) {
        await captureEvent("rec_validation_failed", {
          error: "structured_output_validation_failed",
          attempts: 2,
        });
        return {
          status: "no_call",
          reason:
            "Gemini response did not match the recommendation card schema. Try generating again.",
        };
      }
      throw error;
    }
  } catch (error) {
    const failure = classifyLlmCallFailure(error);
    if (process.env.NODE_ENV !== "production") {
      console.warn("[recommendations] Gemini generation failed", {
        reason: failure.reason,
        status: failure.status,
        message: readErrorMessage(error),
      });
    }
    await captureEvent("llm_call_failed", {
      reason: failure.reason,
      status: failure.status,
    });

    return {
      status: "no_call",
      reason: getNoCallReasonForLlmFailure(failure.reason),
    };
  }
}
