import { describe, it, expect, vi, beforeEach } from "vitest";
import type { PromptInput } from "../promptBuilder";

const mockStreamObject = vi.fn();

vi.mock("ai", () => ({
  streamObject: mockStreamObject,
}));

vi.mock("@/lib/llm/gemini", () => ({
  getGeminiModel: vi.fn(() => "mock-model"),
}));

const baseInput: PromptInput = {
  watchlist: [{ ticker: "AAPL", sector: "Technology", priority: 1 }],
  ohlcvData: {
    AAPL: [
      { timestamp: 1717000000, open: 190, high: 195, low: 189, close: 193, volume: 50_000_000 },
      { timestamp: 1717086400, open: 193, high: 198, low: 192, close: 197, volume: 45_000_000 },
    ],
  },
  newsData: {
    AAPL: [
      { id: 1, headline: "Apple reports strong earnings", summary: "Beat estimates", source: "Reuters", url: "https://example.com", datetime: 1717000000 },
    ],
  },
  riskMode: "balanced",
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("generateCards", () => {
  it("returns variants on successful LLM response", async () => {
    const mockVariants = [
      { ticker: "AAPL", direction: "BUY", entryPrice: 190, targetPrice: 210, holdDays: 5, reasonLine: "Strong earnings momentum", confidenceMode: "aggressive" },
      { ticker: "AAPL", direction: "BUY", entryPrice: 192, targetPrice: 205, holdDays: 7, reasonLine: "Stable growth outlook", confidenceMode: "balanced" },
      { ticker: "AAPL", direction: "BUY", entryPrice: 188, targetPrice: 200, holdDays: 10, reasonLine: "Cautious entry on dips", confidenceMode: "conservative" },
    ];

    mockStreamObject.mockResolvedValue({
      object: Promise.resolve({
        status: "ok",
        variants: mockVariants,
      }),
    });

    const { generateCards } = await import("../generateCards");
    const result = await generateCards(baseInput);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.variants).toHaveLength(3);
      expect(result.variants[0].ticker).toBe("AAPL");
      expect(result.variants[0].confidenceMode).toBe("aggressive");
    }
  });

  it("returns no_call when LLM returns no_call status", async () => {
    mockStreamObject.mockResolvedValue({
      object: Promise.resolve({
        status: "no_call",
        reason: "Insufficient data for analysis",
      }),
    });

    const { generateCards } = await import("../generateCards");
    const result = await generateCards(baseInput);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("Insufficient data for analysis");
    }
  });

  it("returns classified error when streamObject throws", async () => {
    mockStreamObject.mockRejectedValue(new Error("API timeout"));

    const { generateCards } = await import("../generateCards");
    const result = await generateCards(baseInput);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorType).toBe("timeout");
      expect(result.reason).toContain("timed out");
    }
  });

  it("passes system and user prompts to streamObject", async () => {
    mockStreamObject.mockResolvedValue({
      object: Promise.resolve({ status: "no_call", reason: "No data" }),
    });

    const { generateCards } = await import("../generateCards");
    await generateCards(baseInput);

    expect(mockStreamObject).toHaveBeenCalledWith(
      expect.objectContaining({
        schema: expect.any(Object),
        system: expect.stringContaining("not investment advice"),
        prompt: expect.stringContaining("AAPL"),
      }),
    );
  });
});
