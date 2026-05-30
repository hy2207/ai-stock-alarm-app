import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateCards = vi.fn();

vi.mock("../generateCards", () => ({
  generateCards: mockGenerateCards,
}));

const baseInput = {
  watchlist: [{ ticker: "AAPL", sector: "Technology", priority: 1 }],
  ohlcvData: {},
  newsData: {},
  riskMode: "balanced" as const,
};

beforeEach(() => {
  mockGenerateCards.mockClear();
});

describe("generateCardsWithRetry", () => {
  it("returns result directly on first success", async () => {
    mockGenerateCards.mockResolvedValue({
      ok: true,
      variants: [
        { ticker: "AAPL", direction: "BUY", holdDays: 5, reasonLine: "Good", confidenceMode: "aggressive" },
        { ticker: "AAPL", direction: "BUY", holdDays: 7, reasonLine: "Better", confidenceMode: "balanced" },
        { ticker: "AAPL", direction: "BUY", holdDays: 10, reasonLine: "Best", confidenceMode: "conservative" },
      ],
    });

    const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
    const result = await generateCardsWithRetry(baseInput);

    expect(result.ok).toBe(true);
    expect(mockGenerateCards).toHaveBeenCalledTimes(1);
  });

  it("retries once on first failure and returns second success", async () => {
    mockGenerateCards
      .mockResolvedValueOnce({ ok: false, reason: "API error" })
      .mockResolvedValueOnce({
        ok: true,
        variants: [
          { ticker: "AAPL", direction: "BUY", holdDays: 5, reasonLine: "Recovered", confidenceMode: "balanced" },
          { ticker: "AAPL", direction: "BUY", holdDays: 7, reasonLine: "Recovered 2", confidenceMode: "aggressive" },
          { ticker: "AAPL", direction: "BUY", holdDays: 10, reasonLine: "Recovered 3", confidenceMode: "conservative" },
        ],
      });

    const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
    const result = await generateCardsWithRetry(baseInput);

    expect(result.ok).toBe(true);
    expect(mockGenerateCards).toHaveBeenCalledTimes(2);
  });

  it("returns last failure when both attempts fail", async () => {
    mockGenerateCards
      .mockResolvedValueOnce({ ok: false, reason: "Timeout" })
      .mockResolvedValueOnce({ ok: false, reason: "Still failing" });

    const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
    const result = await generateCardsWithRetry(baseInput);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("Still failing");
    }
    expect(mockGenerateCards).toHaveBeenCalledTimes(2);
  });

  it("does not retry on success", async () => {
    mockGenerateCards.mockResolvedValue({
      ok: true,
      variants: [
        { ticker: "AAPL", direction: "BUY", holdDays: 5, reasonLine: "Great", confidenceMode: "balanced" },
        { ticker: "AAPL", direction: "BUY", holdDays: 6, reasonLine: "Great 2", confidenceMode: "aggressive" },
        { ticker: "AAPL", direction: "BUY", holdDays: 7, reasonLine: "Great 3", confidenceMode: "conservative" },
      ],
    });

    const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
    await generateCardsWithRetry(baseInput);

    expect(mockGenerateCards).toHaveBeenCalledTimes(1);
  });

  it("retries on rate_limit then succeeds", async () => {
    mockGenerateCards
      .mockResolvedValueOnce({ ok: false, reason: "Too many requests", errorType: "rate_limit" })
      .mockResolvedValueOnce({
        ok: true,
        variants: [
          { ticker: "AAPL", direction: "BUY", holdDays: 5, reasonLine: "After rate limit", confidenceMode: "balanced" },
          { ticker: "AAPL", direction: "BUY", holdDays: 6, reasonLine: "After rate limit 2", confidenceMode: "aggressive" },
          { ticker: "AAPL", direction: "BUY", holdDays: 7, reasonLine: "After rate limit 3", confidenceMode: "conservative" },
        ],
      });

    const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
    const result = await generateCardsWithRetry(baseInput);

    expect(result.ok).toBe(true);
    expect(mockGenerateCards).toHaveBeenCalledTimes(2);
  });

  it("retries once on api_key error, returns final failure", async () => {
    mockGenerateCards
      .mockResolvedValueOnce({ ok: false, reason: "Invalid API key", errorType: "api_key" })
      .mockResolvedValueOnce({ ok: false, reason: "Still invalid key", errorType: "api_key" });

    const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
    const result = await generateCardsWithRetry(baseInput);

    expect(result.ok).toBe(false);
    expect(mockGenerateCards).toHaveBeenCalledTimes(2);
  });
});
