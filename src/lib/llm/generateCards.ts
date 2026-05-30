import { streamObject } from "ai";
import { getGeminiModel } from "@/lib/llm/gemini";
import {
  llmResponseSchema,
  type LlmVariantCard,
  type LlmResponse,
} from "@/lib/dto/llmOutput";
import { buildPrompt, type PromptInput } from "@/lib/llm/promptBuilder";
import { classifyLlmError, type LlmErrorType } from "@/lib/llm/llmError";

export async function generateCards(
  input: PromptInput,
): Promise<CardGenerationResult> {
  const { system, user } = buildPrompt(input);

  try {
    const result = await streamObject({
      model: getGeminiModel(),
      schema: llmResponseSchema,
      system,
      prompt: user,
    });

    const response: LlmResponse = await result.object;

    if (response.status === "no_call") {
      return { ok: false, reason: response.reason, errorType: "no_call" };
    }

    return { ok: true, variants: response.variants };
  } catch (err) {
    const classified = classifyLlmError(err);
    return {
      ok: false,
      reason: classified.message,
      errorType: classified.type,
    };
  }
}

export interface CardGenerationResultOk {
  ok: true;
  variants: LlmVariantCard[];
}

export interface CardGenerationResultOk {
  ok: true;
  variants: LlmVariantCard[];
}

export interface CardGenerationResultError {
  ok: false;
  reason: string;
  errorType: LlmErrorType | "no_call";
}

export type CardGenerationResult = CardGenerationResultOk | CardGenerationResultError;
