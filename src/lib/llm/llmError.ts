/**
 * Categorised LLM error types returned by classifyLlmError.
 *
 * timeout      — API took too long to respond
 * rate_limit   — 429 / quota exceeded
 * api_key      — 401 / invalid or missing API key
 * api_error    — 5xx or other server-side failure
 * no_response  — LLM returned empty or unparseable content
 * unknown      — unexpected error (framework, network, etc.)
 */
export type LlmErrorType =
  | "timeout"
  | "rate_limit"
  | "api_key"
  | "api_error"
  | "no_response"
  | "unknown";

export interface LlmError {
  type: LlmErrorType;
  message: string;
  /** Original error message for debugging (never exposed to users). */
  raw?: string;
}

/** Human-readable user messages per error type. */
export const LLM_ERROR_MESSAGES: Record<LlmErrorType, string> = {
  timeout:
    "Recommendation generation timed out. Please try again.",
  rate_limit:
    "Too many requests. Please wait a moment and try again.",
  api_key:
    "The AI service is not configured correctly. Contact support.",
  api_error:
    "The AI service is temporarily unavailable. Please try again later.",
  no_response:
    "The AI returned an empty response. Please try again.",
  unknown:
    "Unable to generate recommendations at this time. Please try again later.",
};

/**
 * Classify an unknown thrown value into a structured LlmError.
 */
export function classifyLlmError(err: unknown): LlmError {
  const raw = extractMessage(err);
  const lower = raw.toLowerCase();

  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("deadline") ||
    lower.includes("abort") ||
    lower.includes("cancel")
  ) {
    return { type: "timeout", message: LLM_ERROR_MESSAGES.timeout, raw };
  }

  if (
    lower.includes("429") ||
    lower.includes("rate limit") ||
    lower.includes("rate_limit") ||
    lower.includes("too many requests") ||
    lower.includes("quota")
  ) {
    return { type: "rate_limit", message: LLM_ERROR_MESSAGES.rate_limit, raw };
  }

  if (
    lower.includes("401") ||
    lower.includes("api key") ||
    lower.includes("unauthorized") ||
    lower.includes("forbidden") ||
    lower.includes("permission")
  ) {
    return { type: "api_key", message: LLM_ERROR_MESSAGES.api_key, raw };
  }

  if (
    /5\d{2}/.test(lower) ||
    lower.includes("server error") ||
    lower.includes("internal server")
  ) {
    return { type: "api_error", message: LLM_ERROR_MESSAGES.api_error, raw };
  }

  if (
    lower.includes("empty") ||
    lower.includes("no content") ||
    lower.includes("no response") ||
    (lower.includes("returned") && (lower.includes("null") || lower.includes("undefined"))) ||
    raw.length === 0
  ) {
    return { type: "no_response", message: LLM_ERROR_MESSAGES.no_response, raw };
  }

  return { type: "unknown", message: LLM_ERROR_MESSAGES.unknown, raw };
}

function extractMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
