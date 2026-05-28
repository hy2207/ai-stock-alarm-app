import { describe, it, expect } from "vitest";
import {
  watchlistCreateSchema,
  watchlistSchema,
} from "../watchlist";

describe("watchlistCreateSchema", () => {
  it("parses a valid payload with ticker only", () => {
    const result = watchlistCreateSchema.parse({
      userId: "clx123abc",
      ticker: "AAPL",
      priority: 1,
    });
    expect(result.ticker).toBe("AAPL");
    expect(result.priority).toBe(1);
  });

  it("parses a valid payload with sector only", () => {
    const result = watchlistCreateSchema.parse({
      userId: "clx123abc",
      sector: "Technology",
      priority: 2,
    });
    expect(result.sector).toBe("Technology");
  });

  it("parses a payload with both ticker and sector", () => {
    const result = watchlistCreateSchema.parse({
      userId: "clx123abc",
      ticker: "TSLA",
      sector: "Automotive",
      priority: 3,
    });
    expect(result.ticker).toBe("TSLA");
    expect(result.sector).toBe("Automotive");
  });

  it("rejects payload with neither ticker nor sector", () => {
    const { success, error } = watchlistCreateSchema.safeParse({
      userId: "clx123abc",
      priority: 1,
    });
    expect(success).toBe(false);
    expect(error?.issues.some((i) => i.message.includes("ticker or sector"))).toBe(true);
  });

  it("rejects payload with both ticker and sector as null", () => {
    const { success } = watchlistCreateSchema.safeParse({
      userId: "clx123abc",
      ticker: null,
      sector: null,
      priority: 1,
    });
    expect(success).toBe(false);
  });

  it("rejects priority less than 1", () => {
    const { success } = watchlistCreateSchema.safeParse({
      userId: "clx123abc",
      ticker: "AAPL",
      priority: 0,
    });
    expect(success).toBe(false);
  });

  it("rejects priority greater than 3", () => {
    const { success } = watchlistCreateSchema.safeParse({
      userId: "clx123abc",
      ticker: "AAPL",
      priority: 4,
    });
    expect(success).toBe(false);
  });

  it("rejects non-integer priority", () => {
    const { success } = watchlistCreateSchema.safeParse({
      userId: "clx123abc",
      ticker: "AAPL",
      priority: 1.5,
    });
    expect(success).toBe(false);
  });

  it("rejects missing userId", () => {
    const { success } = watchlistCreateSchema.safeParse({
      ticker: "AAPL",
      priority: 1,
    });
    expect(success).toBe(false);
  });

  it("rejects empty ticker", () => {
    const { success } = watchlistCreateSchema.safeParse({
      userId: "clx123abc",
      ticker: "",
      priority: 1,
    });
    expect(success).toBe(false);
  });

  it("accepts string ticker with null sector", () => {
    const result = watchlistCreateSchema.parse({
      userId: "clx123abc",
      ticker: "AMZN",
      sector: null,
      priority: 2,
    });
    expect(result.ticker).toBe("AMZN");
    expect(result.sector).toBeNull();
  });
});

describe("watchlistSchema (full output)", () => {
  it("parses a full Prisma Watchlist row", () => {
    const result = watchlistSchema.parse({
      id: "clx456ghi",
      userId: "clx123abc",
      ticker: "NVDA",
      sector: null,
      priority: 1,
      createdAt: new Date("2026-05-28"),
    });
    expect(result.id).toBe("clx456ghi");
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("rejects a row with out-of-range priority", () => {
    const { success } = watchlistSchema.safeParse({
      id: "clx456ghi",
      userId: "clx123abc",
      ticker: null,
      sector: "Technology",
      priority: 5,
      createdAt: new Date(),
    });
    expect(success).toBe(false);
  });
});
