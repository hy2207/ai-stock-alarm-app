import { describe, expect, it, vi } from "vitest";
import type { LanguageModel } from "ai";
import {
  classifyLlmCallFailure,
  generateRecommendationCards,
  recommendationGenerationSchema,
  type RecommendationGeneration,
} from "../generateRecommendationCards";
import type { RecommendationPromptInput } from "../promptBuilder";

const model = {} as LanguageModel;

const basePromptInput: RecommendationPromptInput = {
  riskMode: "balanced",
  watchlist: [{ ticker: "AAPL", sector: "Technology", priority: 1 }],
  marketData: {
    AAPL: {
      ohlcv: [
        {
          timestamp: 1717086400,
          open: 193,
          high: 198,
          low: 192,
          close: 197,
          volume: 45_000_000,
        },
      ],
    },
  },
  newsSignals: {
    AAPL: [
      {
        headline: "Apple reports stronger services margin",
        source: "Reuters",
      },
    ],
  },
};

const okGeneration = {
  status: "ok",
  variants: [
    {
      ticker: "AAPL",
      direction: "BUY",
      currentPrice: 197,
      entryPrice: 197,
      targetPrice: 208,
      exitPrice: 214,
      holdDays: 3,
      confidenceMode: "aggressive",
      reasonLine: "서비스 마진 개선과 가격 흐름이 단기 매수 판단을 뒷받침합니다.",
      newsRationaleKo:
        "서비스 매출 개선 뉴스와 단기 가격 회복 흐름을 함께 반영해 공격형 매수 판단을 제시합니다.",
    },
    {
      ticker: "AAPL",
      direction: "BUY",
      currentPrice: 197,
      entryPrice: 195,
      targetPrice: 208,
      exitPrice: 206,
      holdDays: 5,
      confidenceMode: "balanced",
      reasonLine: "실적 개선 신호가 3~5일 중립형 매수 판단을 뒷받침합니다.",
      newsRationaleKo:
        "실적 개선 신호는 긍정적이지만 진입가를 조절해 중립형 기준의 균형 잡힌 매수 판단을 제시합니다.",
    },
    {
      ticker: "AAPL",
      direction: "BUY",
      currentPrice: 197,
      entryRangeLow: 192,
      entryRangeHigh: 196,
      targetPrice: 208,
      exitPrice: 202,
      holdDays: 5,
      confidenceMode: "conservative",
      reasonLine: "서비스 강세는 유지되지만 안정형은 매도 기준을 앞당기는 접근이 적절합니다.",
      newsRationaleKo:
        "서비스 부문 강세는 유지되지만 보수형은 낮은 진입 구간을 기다리는 접근이 적절합니다.",
    },
  ],
} satisfies RecommendationGeneration;

function generateResult(object: unknown) {
  return {
    text: JSON.stringify(object),
  } as Awaited<ReturnType<GenerateRecommendationCardsTextFn>>;
}

type GenerateRecommendationCardsTextFn = NonNullable<
  Parameters<typeof generateRecommendationCards>[0]["generate"]
>;

describe("recommendationGenerationSchema", () => {
  it("accepts exactly three confidence variants", () => {
    const result = recommendationGenerationSchema.safeParse(okGeneration);

    expect(result.success).toBe(true);
  });

  it("rejects ok output missing a confidence mode", () => {
    const result = recommendationGenerationSchema.safeParse({
      ...okGeneration,
      variants: [
        okGeneration.variants[0],
        okGeneration.variants[1],
        { ...okGeneration.variants[1], entryPrice: 196 },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects generated variants without entry or target prices", () => {
    const result = recommendationGenerationSchema.safeParse({
      ...okGeneration,
      variants: [
        { ...okGeneration.variants[0], entryPrice: undefined },
        okGeneration.variants[1],
        okGeneration.variants[2],
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects BUY variants with target below current price", () => {
    const result = recommendationGenerationSchema.safeParse({
      ...okGeneration,
      variants: [
        {
          ...okGeneration.variants[0],
          targetPrice: 190,
        },
        okGeneration.variants[1],
        okGeneration.variants[2],
      ],
    });

    expect(result.success).toBe(false);
  });

  it("accepts SELL variants when aggressive sell price is highest", () => {
    const result = recommendationGenerationSchema.safeParse({
      ...okGeneration,
      variants: [
        {
          ...okGeneration.variants[0],
          direction: "SELL",
          targetPrice: 180,
          exitPrice: 220,
        },
        {
          ...okGeneration.variants[1],
          direction: "SELL",
          targetPrice: 180,
          exitPrice: 205,
        },
        {
          ...okGeneration.variants[2],
          direction: "SELL",
          targetPrice: 180,
          targetRangeLow: undefined,
          targetRangeHigh: undefined,
          exitPrice: 195,
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects SELL variants when aggressive sell price is lowest", () => {
    const result = recommendationGenerationSchema.safeParse({
      ...okGeneration,
      variants: [
        {
          ...okGeneration.variants[0],
          direction: "SELL",
          targetPrice: 180,
          exitPrice: 175,
        },
        {
          ...okGeneration.variants[1],
          direction: "SELL",
          targetPrice: 180,
          exitPrice: 182,
        },
        {
          ...okGeneration.variants[2],
          direction: "SELL",
          targetPrice: 180,
          targetRangeLow: undefined,
          targetRangeHigh: undefined,
          exitPrice: 190,
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("accepts aggressive variants with stop or exit points beyond the consensus target", () => {
    const result = recommendationGenerationSchema.safeParse({
      ...okGeneration,
      variants: [
        {
          ...okGeneration.variants[0],
          targetPrice: 208,
          exitPrice: 216,
        },
        okGeneration.variants[1],
        okGeneration.variants[2],
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects BUY variants when aggressive stop is lower than conservative stop", () => {
    const result = recommendationGenerationSchema.safeParse({
      ...okGeneration,
      variants: [
        { ...okGeneration.variants[0], exitPrice: 200 },
        okGeneration.variants[1],
        { ...okGeneration.variants[2], exitPrice: 214 },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects BUY variants when aggressive sell price is ordered but too far below target", () => {
    const result = recommendationGenerationSchema.safeParse({
      ...okGeneration,
      variants: [
        { ...okGeneration.variants[0], exitPrice: 195 },
        { ...okGeneration.variants[1], exitPrice: 190 },
        { ...okGeneration.variants[2], exitPrice: 185 },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects variants that change the consensus target by risk mode", () => {
    const result = recommendationGenerationSchema.safeParse({
      ...okGeneration,
      variants: [
        okGeneration.variants[0],
        { ...okGeneration.variants[1], targetPrice: 210 },
        okGeneration.variants[2],
      ],
    });

    expect(result.success).toBe(false);
  });
});

describe("classifyLlmCallFailure", () => {
  it("classifies rate limit failures", () => {
    expect(
      classifyLlmCallFailure({ status: 429, message: "Too many requests" }),
    ).toEqual({
      reason: "rate_limit",
      status: 429,
    });
  });

  it("classifies quota and textual 429 failures as rate limits", () => {
    expect(
      classifyLlmCallFailure(new Error("429 Too Many Requests: quota exceeded")),
    ).toEqual({
      reason: "rate_limit",
      status: null,
    });
  });

  it("classifies timeout failures", () => {
    const error = new Error("Request timed out");
    error.name = "AbortError";

    expect(classifyLlmCallFailure(error)).toEqual({
      reason: "timeout",
      status: null,
    });
  });

  it("classifies provider API key or permission failures", () => {
    expect(
      classifyLlmCallFailure(new Error("401 Unauthorized - invalid API key")),
    ).toEqual({
      reason: "api_key",
      status: null,
    });

    expect(
      classifyLlmCallFailure({ code: 403, message: "Permission denied" }),
    ).toEqual({
      reason: "api_key",
      status: 403,
    });
  });

  it("classifies empty model responses", () => {
    expect(classifyLlmCallFailure(new Error("empty response from model"))).toEqual({
      reason: "no_response",
      status: null,
    });
  });

  it("classifies provider 5xx failures as API errors", () => {
    expect(classifyLlmCallFailure({ status: 503 })).toEqual({
      reason: "api_error",
      status: 503,
    });
  });

  it("classifies server error messages as API errors", () => {
    expect(classifyLlmCallFailure(new Error("502 Bad Gateway"))).toEqual({
      reason: "api_error",
      status: null,
    });
  });

  it("falls back to llm_call_failed for unknown errors", () => {
    expect(classifyLlmCallFailure("unexpected provider shape")).toEqual({
      reason: "llm_call_failed",
      status: null,
    });
  });
});

describe("generateRecommendationCards", () => {
  it("GWT: Given prompt context When generateText succeeds Then returns validated variants", async () => {
    const generate = vi.fn().mockReturnValue(generateResult(okGeneration));

    const result = await generateRecommendationCards({
      promptInput: basePromptInput,
      model,
      generate,
    });

    expect(result).toEqual(okGeneration);
    expect(generate).toHaveBeenCalledTimes(1);
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({
        model,
        system: expect.stringContaining("Decision Layer"),
        prompt: expect.stringContaining("SELECTED RISK MODE: balanced"),
        maxOutputTokens: 1_600,
        providerOptions: {
          google: {
            thinkingConfig: {
              thinkingLevel: "minimal",
              includeThoughts: false,
            },
          },
        },
        timeout: { totalMs: 25_000 },
      }),
    );
  });

  it("GWT: Given model returns No Call When generation completes Then passes through No Call", async () => {
    const generate = vi.fn().mockReturnValue(
      generateResult({
        status: "no_call",
        reason: "Insufficient market and news evidence for a decision.",
      }),
    );

    const result = await generateRecommendationCards({
      promptInput: basePromptInput,
      model,
      generate,
    });

    expect(result).toEqual({
      status: "no_call",
      reason: "Insufficient market and news evidence for a decision.",
    });
  });

  it("GWT: Given invalid structured output When validation fails Then returns No Call fallback", async () => {
    const captureEvent = vi.fn().mockResolvedValue(undefined);
    const invalidGeneration = {
      ...okGeneration,
      variants: [{ ...okGeneration.variants[0], holdDays: 11 }],
    };
    const generate = vi
      .fn()
      .mockReturnValueOnce(generateResult(invalidGeneration))
      .mockReturnValueOnce(generateResult(invalidGeneration));

    const result = await generateRecommendationCards({
      promptInput: basePromptInput,
      model,
      generate,
      captureEvent,
    });

    expect(result.status).toBe("no_call");
    expect(generate).toHaveBeenCalledTimes(2);
    expect(captureEvent).toHaveBeenCalledWith("rec_validation_failed", {
      error: "structured_output_validation_failed",
      attempts: 2,
    });
  });

  it("GWT: Given first structured output is invalid When retry succeeds Then returns retry result", async () => {
    const captureEvent = vi.fn().mockResolvedValue(undefined);
    const generate = vi
      .fn()
      .mockReturnValueOnce(
        generateResult({
          ...okGeneration,
          variants: [{ ...okGeneration.variants[0], holdDays: 11 }],
        }),
      )
      .mockReturnValueOnce(generateResult(okGeneration));

    const result = await generateRecommendationCards({
      promptInput: basePromptInput,
      model,
      generate,
      captureEvent,
    });

    expect(result).toEqual(okGeneration);
    expect(generate).toHaveBeenCalledTimes(2);
    expect(generate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        prompt: expect.stringContaining("SELECTED RISK MODE: balanced"),
      }),
    );
    expect(generate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        prompt: expect.stringContaining("SELECTED RISK MODE: balanced"),
      }),
    );
    expect(captureEvent).not.toHaveBeenCalled();
  });

  it("GWT: Given empty watchlist When generating Then avoids LLM call and returns No Call", async () => {
    const generate = vi.fn();

    const result = await generateRecommendationCards({
      promptInput: { ...basePromptInput, watchlist: [] },
      model,
      generate,
    });

    expect(result).toEqual({
      status: "no_call",
      reason: "Watchlist is empty. Add at least one ticker before generating.",
    });
    expect(generate).not.toHaveBeenCalled();
  });

  it("GWT: Given rate limit error When generateText fails Then emits llm_call_failed and returns No Call", async () => {
    const captureEvent = vi.fn().mockResolvedValue(undefined);
    const generate = vi.fn().mockImplementation(() => {
      throw { status: 429, message: "rate limit exceeded" };
    });

    const result = await generateRecommendationCards({
      promptInput: basePromptInput,
      model,
      generate,
      captureEvent,
    });

    expect(result.status).toBe("no_call");
    expect(captureEvent).toHaveBeenCalledWith("llm_call_failed", {
      reason: "rate_limit",
      status: 429,
    });
  });

  it("GWT: Given timeout during generation When generation fails Then emits timeout event", async () => {
    const captureEvent = vi.fn().mockResolvedValue(undefined);
    const timeoutError = new Error("Gemini request timed out");
    const generate = vi.fn().mockRejectedValue(timeoutError);

    const result = await generateRecommendationCards({
      promptInput: basePromptInput,
      model,
      generate,
      captureEvent,
    });

    expect(result.status).toBe("no_call");
    expect(captureEvent).toHaveBeenCalledWith("llm_call_failed", {
      reason: "timeout",
      status: null,
    });
  });

  it("GWT: Given hanging generation When generation exceeds timeout Then returns No Call", async () => {
    vi.useFakeTimers();
    const captureEvent = vi.fn().mockResolvedValue(undefined);
    const generate = vi.fn().mockReturnValue(new Promise(() => undefined));

    try {
      const pending = generateRecommendationCards({
        promptInput: basePromptInput,
        model,
        generate,
        captureEvent,
      });

      await vi.advanceTimersByTimeAsync(25_000);
      const result = await pending;

      expect(result.status).toBe("no_call");
      if (result.status !== "no_call") {
        throw new Error("Expected No Call result");
      }
      expect(result.reason).toContain("timed out");
      expect(captureEvent).toHaveBeenCalledWith("llm_call_failed", {
        reason: "timeout",
        status: null,
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("GWT: Given API key failure When generateText fails Then emits api_key reason and returns No Call", async () => {
    const captureEvent = vi.fn().mockResolvedValue(undefined);
    const generate = vi.fn().mockImplementation(() => {
      throw new Error("401 Unauthorized - invalid API key");
    });

    const result = await generateRecommendationCards({
      promptInput: basePromptInput,
      model,
      generate,
      captureEvent,
    });

    expect(result.status).toBe("no_call");
    expect(captureEvent).toHaveBeenCalledWith("llm_call_failed", {
      reason: "api_key",
      status: null,
    });
  });
});
