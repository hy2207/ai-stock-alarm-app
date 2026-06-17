import { describe, expect, it } from "vitest";
import {
  buildWatchlistInput,
  getOnboardingSelectionState,
  toggleOnboardingSelection,
  validateOnboardingSelection,
} from "../onboardingSelection";

const items = [
  { ticker: "AAPL", kind: "ticker" as const },
  { ticker: "TECH", kind: "sector" as const },
  { ticker: "TSLA", kind: "ticker" as const },
  { ticker: "HEALTH", kind: "sector" as const },
];

describe("onboarding selection", () => {
  it("adds and removes a selected item", () => {
    const selected = toggleOnboardingSelection([], "AAPL");

    expect(selected).toEqual(["AAPL"]);
    expect(toggleOnboardingSelection(selected, "AAPL")).toEqual([]);
  });

  it("blocks selecting more than three items", () => {
    const selected = ["AAPL", "TSLA", "TECH"];

    expect(toggleOnboardingSelection(selected, "HEALTH")).toEqual(selected);
    expect(getOnboardingSelectionState(selected)).toEqual({
      count: 3,
      max: 3,
      canSubmit: true,
      isAtMax: true,
      helperText: "3/3 selected",
    });
  });

  it("requires at least one item before submit", () => {
    expect(validateOnboardingSelection([])).toEqual({
      ok: false,
      message: "Select at least one ticker or sector.",
    });
  });

  it("builds saveWatchlist input with ticker and sector payloads", () => {
    expect(buildWatchlistInput(["AAPL", "TECH"], items)).toEqual({
      items: [{ ticker: "AAPL" }, { sector: "TECH" }],
    });
  });

  it("rejects selected values that are not in the available item list", () => {
    expect(() => buildWatchlistInput(["UNKNOWN"], items)).toThrow(
      "Unknown watchlist item: UNKNOWN",
    );
  });
});
