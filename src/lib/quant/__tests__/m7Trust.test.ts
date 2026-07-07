import { describe, it, expect } from "vitest";
import { nextTradingDateAfter, signedErrorPct, M7_TICKERS } from "../m7Trust";

describe("nextTradingDateAfter", () => {
  it("returns the next weekday after a mid-week date", () => {
    expect(nextTradingDateAfter("2026-07-07")).toBe("2026-07-08"); // Tue → Wed
  });

  it("skips the weekend after a Friday", () => {
    expect(nextTradingDateAfter("2026-07-10")).toBe("2026-07-13"); // Fri → Mon
  });

  it("skips Sunday when starting from Saturday", () => {
    expect(nextTradingDateAfter("2026-07-11")).toBe("2026-07-13"); // Sat → Mon
  });

  it("crosses month boundaries", () => {
    expect(nextTradingDateAfter("2026-07-31")).toBe("2026-08-03"); // Fri → Mon
  });
});

describe("signedErrorPct", () => {
  it("is positive when the actual close beats the prediction", () => {
    expect(signedErrorPct(100, 105)).toBeCloseTo(5, 2);
  });

  it("is negative when the actual close falls short", () => {
    expect(signedErrorPct(200, 190)).toBeCloseTo(-5, 2);
  });

  it("is zero for an exact hit", () => {
    expect(signedErrorPct(150, 150)).toBe(0);
  });
});

describe("M7_TICKERS", () => {
  it("contains exactly the Magnificent 7", () => {
    expect([...M7_TICKERS].sort()).toEqual(
      ["AAPL", "AMZN", "GOOGL", "META", "MSFT", "NVDA", "TSLA"],
    );
  });
});
