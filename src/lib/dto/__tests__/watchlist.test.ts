import { describe, it, expect } from "vitest";
import { watchlistCreateSchema, watchlistSchema } from "../watchlist";

describe("watchlistCreateSchema", () => {
  it("accepts a valid ticker item", () => {
    const result = watchlistCreateSchema.parse({
      userId: "clx123abc456def789ghi012j",
      ticker: "AAPL",
      priority: 1,
    });
    expect(result.ticker).toBe("AAPL");
    expect(result.priority).toBe(1);
  });

  it("rejects an empty ticker", () => {
    const { success } = watchlistCreateSchema.safeParse({
      userId: "clx123abc456def789ghi012j",
      ticker: "",
      priority: 1,
    });
    expect(success).toBe(false);
  });

  it("rejects a missing ticker", () => {
    const { success } = watchlistCreateSchema.safeParse({
      userId: "clx123abc456def789ghi012j",
      priority: 1,
    });
    expect(success).toBe(false);
  });

  it("rejects priority outside 1-3", () => {
    const { success } = watchlistCreateSchema.safeParse({
      userId: "clx123abc456def789ghi012j",
      ticker: "TSLA",
      priority: 4,
    });
    expect(success).toBe(false);
  });

  it("rejects a ticker longer than 10 chars", () => {
    const { success } = watchlistCreateSchema.safeParse({
      userId: "clx123abc456def789ghi012j",
      ticker: "TOOLONGTICKER",
      priority: 1,
    });
    expect(success).toBe(false);
  });
});

describe("watchlistSchema (full output)", () => {
  it("parses a full Prisma Watchlist row", () => {
    const result = watchlistSchema.parse({
      id: "clxwl0000000000000000001",
      userId: "clx123abc456def789ghi012j",
      ticker: "NVDA",
      priority: 2,
      createdAt: new Date("2026-06-01T00:00:00.000Z"),
    });
    expect(result.ticker).toBe("NVDA");
    expect(result.priority).toBe(2);
  });

  it("allows null ticker in stored rows (legacy)", () => {
    const result = watchlistSchema.parse({
      id: "clxwl0000000000000000002",
      userId: "clx123abc456def789ghi012j",
      ticker: null,
      priority: 1,
      createdAt: new Date("2026-06-01T00:00:00.000Z"),
    });
    expect(result.ticker).toBeNull();
  });
});
