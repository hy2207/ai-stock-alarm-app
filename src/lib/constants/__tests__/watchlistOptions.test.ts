import { describe, expect, it } from "vitest";
import { tickerWatchlistOptions, watchlistOptions } from "../watchlistOptions";

const magnificentSeven = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "META",
  "TSLA",
];

describe("watchlistOptions", () => {
  it("includes all Magnificent 7 tickers as selectable ticker options", () => {
    expect(watchlistOptions.map((option) => option.ticker)).toEqual(
      magnificentSeven,
    );
    expect(tickerWatchlistOptions).toHaveLength(7);
    expect(tickerWatchlistOptions.every((option) => option.kind === "ticker"))
      .toBe(true);
  });
});
