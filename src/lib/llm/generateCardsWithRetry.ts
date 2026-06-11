import {
  generateCards,
  type CardGenerationResult,
} from "@/lib/llm/generateCards";
import type { PromptInput } from "@/lib/llm/promptBuilder";

/** Maximum retry attempts on validation/API failure. */
const MAX_RETRIES = 1;

/**
 * Wrapper around generateCards that retries once on failure.
 *
 * 1st attempt → success? return.
 * 1st attempt → error? retry once.
 * 2nd attempt → error? return the error as final.
 *
 * This keeps the caller code simple — retry is transparent.
 */
export async function generateCardsWithRetry(
  input: PromptInput,
): Promise<CardGenerationResult> {
  const firstAttempt = await generateCards(input);
  if (firstAttempt.ok) return firstAttempt;

  const secondAttempt = await generateCards(input);
  if (secondAttempt.ok) return secondAttempt;

  return secondAttempt;
}
