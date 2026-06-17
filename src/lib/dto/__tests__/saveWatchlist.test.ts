import { describe, it, expect } from "vitest";
import {
  saveWatchlistInputSchema,
  watchlistItemSchema,
} from "../saveWatchlist";

describe("watchlistItemSchema", () => {
  it("accepts a valid ticker item", () => {
    const result = watchlistItemSchema.parse({ ticker: "AAPL" });
    expect(result.ticker).toBe("AAPL");
  });

  it("accepts a valid sector item", () => {
    const result = watchlistItemSchema.parse({ sector: "Technology" });
    expect(result.sector).toBe("Technology");
  });

  it("accepts both ticker and sector", () => {
    const result = watchlistItemSchema.parse({
      ticker: "TSLA",
      sector: "Automotive",
    });
    expect(result.ticker).toBe("TSLA");
    expect(result.sector).toBe("Automotive");
  });

  it("rejects empty item (no ticker or sector)", () => {
    const { success } = watchlistItemSchema.safeParse({});
    expect(success).toBe(false);
  });

  it("rejects item when ticker and sector are both null", () => {
    const { success, error } = watchlistItemSchema.safeParse({
      ticker: null,
      sector: null,
    });

    expect(success).toBe(false);
    expect(error?.issues.length).toBeGreaterThan(0);
  });

  it("rejects item with empty string ticker", () => {
    const { success } = watchlistItemSchema.safeParse({ ticker: "" });
    expect(success).toBe(false);
  });

  it("rejects item with ticker over 10 characters", () => {
    const { success } = watchlistItemSchema.safeParse({
      ticker: "ABCDEFGHIJK",
    });
    expect(success).toBe(false);
  });

  it("rejects item with sector over 50 characters", () => {
    const { success } = watchlistItemSchema.safeParse({
      sector: "A".repeat(51),
    });
    expect(success).toBe(false);
  });
});

describe("saveWatchlistInputSchema", () => {
  it("accepts an array of 1 item", () => {
    const result = saveWatchlistInputSchema.parse({
      items: [{ ticker: "AAPL" }],
    });
    expect(result.items).toHaveLength(1);
  });

  it("accepts an array of 3 items", () => {
    const items = [
      { ticker: "AAPL" },
      { sector: "Technology" },
      { ticker: "NVDA" },
    ] as const;
    const result = saveWatchlistInputSchema.parse({ items });
    expect(result.items).toHaveLength(3);
  });

  it("accepts mixed ticker and sector items", () => {
    const result = saveWatchlistInputSchema.parse({
      items: [
        { ticker: "AAPL" },
        { sector: "Healthcare" },
        { ticker: "AMZN", sector: "E-Commerce" },
      ],
    });
    expect(result.items[1].sector).toBe("Healthcare");
    expect(result.items[2].ticker).toBe("AMZN");
  });

  it("rejects empty items array", () => {
    const { success } = saveWatchlistInputSchema.safeParse({ items: [] });
    expect(success).toBe(false);
  });

  it("rejects more than 3 items", () => {
    const { success } = saveWatchlistInputSchema.safeParse({
      items: [
        { ticker: "A" },
        { ticker: "B" },
        { ticker: "C" },
        { ticker: "D" },
      ],
    });
    expect(success).toBe(false);
  });

  it("rejects if any item is invalid", () => {
    const { success, error } = saveWatchlistInputSchema.safeParse({
      items: [{ ticker: "AAPL" }, {}],
    });
    expect(success).toBe(false);
    expect(error?.issues.some((i) => i.message.includes("ticker or sector"))).toBe(true);
  });

  it("rejects GWT case: Given ticker and sector are null When parsed Then validation fails", () => {
    const { success } = saveWatchlistInputSchema.safeParse({
      items: [{ ticker: null, sector: null }],
    });

    expect(success).toBe(false);
  });

  it("infers correct TypeScript types", () => {
    type Input = import("zod").infer<typeof saveWatchlistInputSchema>;
    const payload: Input = { items: [{ ticker: "AAPL" }] };
    expect(payload.items[0].ticker).toBe("AAPL");
  });
});
