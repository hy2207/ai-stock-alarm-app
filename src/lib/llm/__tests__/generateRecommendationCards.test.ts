import { describe, expect, it, vi } from "vitest";
import type { LanguageModel, StreamObjectResult } from "ai";
import {
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
      entryPrice: 197,
      targetPrice: 208,
      stopPrice: 189,
      holdDays: 3,
      confidenceMode: "aggressive",
      reasonLine: "Services margin and price momentum support a short swing.",
    },
    {
      ticker: "AAPL",
      direction: "BUY",
      entryPrice: 195,
      targetPrice: 205,
      stopPrice: 188,
      holdDays: 5,
      confidenceMode: "balanced",
      reasonLine: "Earnings strength supports a measured 3-5 day setup.",
    },
    {
      ticker: "AAPL",
      direction: "BUY",
      entryRangeLow: 192,
      entryRangeHigh: 196,
      targetRangeLow: 202,
      targetRangeHigh: 206,
      stopPrice: 187,
      holdDays: 5,
      confidenceMode: "conservative",
      reasonLine: "Wait for a controlled entry while services strength holds.",
    },
  ],
} satisfies RecommendationGeneration;

function streamResult(object: unknown) {
  return {
    object: Promise.resolve(object),
  } as StreamObjectResult<unknown, unknown, never>;
}

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
});

describe("generateRecommendationCards", () => {
  it("GWT: Given prompt context When streamObject succeeds Then returns validated variants", async () => {
    const stream = vi.fn().mockReturnValue(streamResult(okGeneration));

    const result = await generateRecommendationCards({
      promptInput: basePromptInput,
      model,
      stream,
    });

    expect(result).toEqual(okGeneration);
    expect(stream).toHaveBeenCalledWith(
      expect.objectContaining({
        model,
        schema: recommendationGenerationSchema,
        schemaName: "RecommendationGeneration",
        system: expect.stringContaining("Decision Layer"),
        prompt: expect.stringContaining("SELECTED RISK MODE: balanced"),
      }),
    );
  });

  it("GWT: Given model returns No Call When generation completes Then passes through No Call", async () => {
    const stream = vi.fn().mockReturnValue(
      streamResult({
        status: "no_call",
        reason: "Insufficient market and news evidence for a decision.",
      }),
    );

    const result = await generateRecommendationCards({
      promptInput: basePromptInput,
      model,
      stream,
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
    const stream = vi
      .fn()
      .mockReturnValueOnce(streamResult(invalidGeneration))
      .mockReturnValueOnce(streamResult(invalidGeneration));

    const result = await generateRecommendationCards({
      promptInput: basePromptInput,
      model,
      stream,
      captureEvent,
    });

    expect(result.status).toBe("no_call");
    expect(stream).toHaveBeenCalledTimes(2);
    expect(captureEvent).toHaveBeenCalledWith("rec_validation_failed", {
      error: "structured_output_validation_failed",
      attempts: 2,
    });
  });

  it("GWT: Given first structured output is invalid When retry succeeds Then returns retry result", async () => {
    const captureEvent = vi.fn().mockResolvedValue(undefined);
    const stream = vi
      .fn()
      .mockReturnValueOnce(
        streamResult({
          ...okGeneration,
          variants: [{ ...okGeneration.variants[0], holdDays: 11 }],
        }),
      )
      .mockReturnValueOnce(streamResult(okGeneration));

    const result = await generateRecommendationCards({
      promptInput: basePromptInput,
      model,
      stream,
      captureEvent,
    });

    expect(result).toEqual(okGeneration);
    expect(stream).toHaveBeenCalledTimes(2);
    expect(captureEvent).not.toHaveBeenCalled();
  });

  it("GWT: Given empty watchlist When generating Then avoids LLM call and returns No Call", async () => {
    const stream = vi.fn();

    const result = await generateRecommendationCards({
      promptInput: { ...basePromptInput, watchlist: [] },
      model,
      stream,
    });

    expect(result).toEqual({
      status: "no_call",
      reason: "Watchlist is empty. Add at least one ticker before generating.",
    });
    expect(stream).not.toHaveBeenCalled();
  });
});
