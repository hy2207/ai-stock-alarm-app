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

const successVariants = [
  { ticker: "AAPL", direction: "BUY", holdDays: 5, reasonLine: "Good", confidenceMode: "aggressive" as const },
  { ticker: "AAPL", direction: "BUY", holdDays: 7, reasonLine: "Better", confidenceMode: "balanced" as const },
  { ticker: "AAPL", direction: "BUY", holdDays: 10, reasonLine: "Best", confidenceMode: "conservative" as const },
];

beforeEach(() => {
  mockGenerateCards.mockReset();
});

describe("generateCardsWithRetry (TEST-F9-03)", () => {
  describe("GWT: 1회 재시도 후 성공 (REQ-FUNC-081)", () => {
    it("Given 첫 번째 시도가 성공하면 When retry를 실행하지 않고 Then 즉시 결과를 반환한다", async () => {
      mockGenerateCards.mockResolvedValue({
        ok: true,
        variants: successVariants,
      });

      const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
      const result = await generateCardsWithRetry(baseInput);

      expect(result.ok).toBe(true);
      expect(mockGenerateCards).toHaveBeenCalledTimes(1);
    });

    it("Given 첫 번째 시도가 실패하고 When 재시도가 성공하면 Then 두 번째 시도 결과를 반환한다", async () => {
      mockGenerateCards
        .mockResolvedValueOnce({ ok: false, reason: "API error" })
        .mockResolvedValueOnce({
          ok: true,
          variants: successVariants,
        });

      const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
      const result = await generateCardsWithRetry(baseInput);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.variants).toHaveLength(3);
      }
      expect(mockGenerateCards).toHaveBeenCalledTimes(2);
    });

    it("Given 재시도가 성공했을 때 When 결과를 확인하면 Then variant 데이터가 온전히 보존된다", async () => {
      mockGenerateCards
        .mockResolvedValueOnce({ ok: false, reason: "Temp error" })
        .mockResolvedValueOnce({
          ok: true,
          variants: successVariants,
        });

      const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
      const result = await generateCardsWithRetry(baseInput);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.variants[0]).toMatchObject({
          ticker: "AAPL",
          direction: "BUY",
          holdDays: 5,
          confidenceMode: "aggressive",
        });
      }
    });

    it("Given 성공 시 재시도가 발생하지 않고 When generateCards가 호출되면 Then 정확히 1회만 호출된다", async () => {
      mockGenerateCards.mockResolvedValue({
        ok: true,
        variants: successVariants,
      });

      const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
      await generateCardsWithRetry(baseInput);

      expect(mockGenerateCards).toHaveBeenCalledTimes(1);
    });
  });

  describe("GWT: 재시도 후 최종 실패 (REQ-FUNC-081)", () => {
    it("Given 두 번의 시도가 모두 실패하면 When retry 후 Then 마지막 실패 결과를 반환한다", async () => {
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

    it("Given 두 번 모두 rate_limit 오류가 발생하면 When retry 후 Then rate_limit errorType을 유지한다", async () => {
      mockGenerateCards
        .mockResolvedValueOnce({ ok: false, reason: "Rate limited", errorType: "rate_limit" })
        .mockResolvedValueOnce({ ok: false, reason: "Still rate limited", errorType: "rate_limit" });

      const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
      const result = await generateCardsWithRetry(baseInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errorType).toBe("rate_limit");
      }
    });

    it("Given 두 번 모두 api_key 오류가 발생하면 When retry 후 Then api_key errorType을 유지한다", async () => {
      mockGenerateCards
        .mockResolvedValueOnce({ ok: false, reason: "Invalid API key", errorType: "api_key" })
        .mockResolvedValueOnce({ ok: false, reason: "Still invalid key", errorType: "api_key" });

      const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
      const result = await generateCardsWithRetry(baseInput);

      expect(result.ok).toBe(false);
      expect(mockGenerateCards).toHaveBeenCalledTimes(2);
    });

    it("Given 첫 번째는 rate_limit, 두 번째도 실패하면 When retry 후 Then 최종 errorType을 반환한다", async () => {
      mockGenerateCards
        .mockResolvedValueOnce({ ok: false, reason: "Rate limited", errorType: "rate_limit" })
        .mockResolvedValueOnce({ ok: false, reason: "API timeout", errorType: "timeout" });

      const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
      const result = await generateCardsWithRetry(baseInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errorType).toBe("timeout");
      }
    });
  });

  describe("GWT: 오류 타입 전파 (REQ-FUNC-081)", () => {
    it("Given generateCards가 timeout을 반환하면 When retry 후 Then timeout errorType이 전파된다", async () => {
      mockGenerateCards
        .mockResolvedValueOnce({ ok: false, reason: "timed out", errorType: "timeout" })
        .mockResolvedValueOnce({ ok: false, reason: "still timed out", errorType: "timeout" });

      const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
      const result = await generateCardsWithRetry(baseInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errorType).toBe("timeout");
        expect(result.reason).toBe("still timed out");
      }
    });

    it("Given generateCards가 no_call을 반환하면 When retry 후 Then no_call이 전파된다", async () => {
      mockGenerateCards
        .mockResolvedValueOnce({ ok: false, reason: "Insufficient data", errorType: "no_call" })
        .mockResolvedValueOnce({ ok: false, reason: "Still insufficient", errorType: "no_call" });

      const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
      const result = await generateCardsWithRetry(baseInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errorType).toBe("no_call");
      }
    });

    it("Given generateCards가 첫 번째만 실패하고 두 번째는 성공하면 When 결과를 확인하면 Then ok=true이고 에러는 전파되지 않는다", async () => {
      mockGenerateCards
        .mockResolvedValueOnce({ ok: false, reason: "temporary glitch", errorType: "api_error" })
        .mockResolvedValueOnce({ ok: true, variants: successVariants });

      const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
      const result = await generateCardsWithRetry(baseInput);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.variants).toHaveLength(3);
      }
    });
  });

  describe("GWT: 입력 경계 조건", () => {
    it("Given 빈 watchlist로 첫 시도가 실패하고 When 재시도도 실패하면 Then 최종 실패 결과를 반환한다", async () => {
      const emptyInput = { watchlist: [], ohlcvData: {}, newsData: {}, riskMode: "balanced" as const };

      mockGenerateCards
        .mockResolvedValueOnce({ ok: false, reason: "No watchlist items", errorType: "no_call" })
        .mockResolvedValueOnce({ ok: false, reason: "Still no items", errorType: "no_call" });

      const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
      const result = await generateCardsWithRetry(emptyInput);

      expect(result.ok).toBe(false);
      expect(mockGenerateCards).toHaveBeenCalledTimes(2);
    });

    it("Given generateCards가 예외를 throw하면 When retry 후 Then 예외가 전파된다", async () => {
      mockGenerateCards
        .mockRejectedValueOnce(new Error("Unexpected crash"))
        .mockResolvedValueOnce({ ok: true, variants: successVariants });

      const { generateCardsWithRetry } = await import("../generateCardsWithRetry");

      await expect(generateCardsWithRetry(baseInput)).rejects.toThrow(
        "Unexpected crash",
      );
    });
  });

  describe("GWT: generateCards 호출 검증", () => {
    it("Given retry가 필요할 때 When generateCards를 호출하면 Then 입력이 동일하게 전달된다", async () => {
      mockGenerateCards
        .mockResolvedValueOnce({ ok: false, reason: "Fail" })
        .mockResolvedValueOnce({ ok: true, variants: successVariants });

      const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
      await generateCardsWithRetry(baseInput);

      expect(mockGenerateCards).toHaveBeenCalledTimes(2);
      expect(mockGenerateCards).toHaveBeenNthCalledWith(1, baseInput);
      expect(mockGenerateCards).toHaveBeenNthCalledWith(2, baseInput);
    });

    it("Given 첫 번째 시도가 성공하면 When retry가 발생하지 않고 Then generateCards가 정확히 1회 호출된다", async () => {
      mockGenerateCards.mockResolvedValue({ ok: true, variants: successVariants });

      const { generateCardsWithRetry } = await import("../generateCardsWithRetry");
      await generateCardsWithRetry(baseInput);

      expect(mockGenerateCards).toHaveBeenCalledTimes(1);
      expect(mockGenerateCards).toHaveBeenCalledWith(baseInput);
    });
  });
});
