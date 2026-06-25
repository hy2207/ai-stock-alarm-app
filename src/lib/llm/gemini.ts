import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env } from "node:process";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

function getGeminiApiKey(): string {
  const key = env.GEMINI_API_KEY;
  if (!key || key === "your-gemini-api-key") {
    throw new Error(
      "GEMINI_API_KEY is not set. Configure it in your environment.",
    );
  }
  return key;
}

function getGeminiModelName(): string {
  return env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}

function normalizeGeminiModelName(modelName: string): string {
  return modelName.replace(/^models\//, "");
}

function createGeminiProvider() {
  return createGoogleGenerativeAI({
    apiKey: getGeminiApiKey(),
  });
}

/** Lazily initialised Google Gemini provider. */
let geminiProvider: ReturnType<typeof createGoogleGenerativeAI> | null = null;

/** Returns the singleton Google Generative AI provider. */
export function getGeminiProvider() {
  if (!geminiProvider) {
    geminiProvider = createGeminiProvider();
  }
  return geminiProvider;
}

/** Returns the Gemini language model configured via GEMINI_MODEL env. */
export function getGeminiModel() {
  const modelName = normalizeGeminiModelName(getGeminiModelName());
  return getGeminiProvider()(
    modelName as Parameters<ReturnType<typeof createGoogleGenerativeAI>>[0],
  );
}
