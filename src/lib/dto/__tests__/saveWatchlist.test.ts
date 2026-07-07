import { describe, it, expect } from "vitest";
import {
  watchlistItemSchema,
  saveWatchlistInputSchema,
} from "../saveWatchlist";

describe("watchlistItemSchema", () => {
  it("accepts a valid ticker item", () => {
    const result = watchlistItemSchema.parse({ ticker: "AAPL" });
    expect(result.ticker).toBe("AAPL");
  });

  it("rejects an empty item", () => {
    const { success } = watchlistItemSchema.safeParse({});
    expect(success).toBe(false);
  });

  it("rejects an empty-string ticker", () => {
    const { success } = watchlistItemSchema.safeParse({ ticker: "" });
    expect(success).toBe(false);
  });

  it("rejects a ticker over 10 characters", () => {
    const { success } = watchlistItemSchema.safeParse({ ticker: "TOOLONGTICKER" });
    expect(success).toBe(false);
  });
});

describe("saveWatchlistInputSchema", () => {
  it("accepts an array of 1 item", () => {
    const result = saveWatchlistInputSchema.parse({ items: [{ ticker: "AAPL" }] });
    expect(result.items).toHaveLength(1);
  });

  it("accepts an array of 3 items", () => {
    const result = saveWatchlistInputSchema.parse({
      items: [{ ticker: "AAPL" }, { ticker: "MSFT" }, { ticker: "NVDA" }],
    });
    expect(result.items).toHaveLength(3);
    expect(result.items[1].ticker).toBe("MSFT");
  });

  it("rejects an empty items array", () => {
    const { success } = saveWatchlistInputSchema.safeParse({ items: [] });
    expect(success).toBe(false);
  });

  it("rejects more than 3 items", () => {
    const { success } = saveWatchlistInputSchema.safeParse({
      items: [
        { ticker: "AAPL" },
        { ticker: "MSFT" },
        { ticker: "NVDA" },
        { ticker: "TSLA" },
      ],
    });
    expect(success).toBe(false);
  });

  it("rejects items missing ticker", () => {
    const { success } = saveWatchlistInputSchema.safeParse({
      items: [{ ticker: null }],
    });
    expect(success).toBe(false);
  });
});
