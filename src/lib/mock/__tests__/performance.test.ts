import { describe, it, expect } from "vitest";
import { performanceRecordCreateSchema } from "../../dto/performanceRecord";
import {
  mockPerformanceRecords,
  mockNoPerformanceRecords,
  MOCK_CARD_ID,
} from "../performance";

describe("mockPerformanceRecords", () => {
  it("has exactly 30 items", () => {
    expect(mockPerformanceRecords).toHaveLength(30);
  });

  it("all 30 items pass Zod validation", () => {
    for (const rec of mockPerformanceRecords) {
      const result = performanceRecordCreateSchema.safeParse(rec);
      expect(result.success).toBe(true);
    }
  });

  it("all have the same recId", () => {
    for (const rec of mockPerformanceRecords) {
      expect(rec.recId).toBe(MOCK_CARD_ID);
    }
  });

  it("includes hit, miss, and pending records", () => {
    const hits = mockPerformanceRecords.filter((r) => r.hitFlag === true);
    const misses = mockPerformanceRecords.filter((r) => r.hitFlag === false);
    const pending = mockPerformanceRecords.filter((r) => r.hitFlag === null);
    expect(hits.length).toBeGreaterThan(0);
    expect(misses.length).toBeGreaterThan(0);
    expect(pending.length).toBeGreaterThan(0);
  });

  it("has BUY and SELL predictions", () => {
    const buys = mockPerformanceRecords.filter(
      (r) => r.predictedDirection === "BUY",
    );
    const sells = mockPerformanceRecords.filter(
      (r) => r.predictedDirection === "SELL",
    );
    expect(buys.length).toBeGreaterThan(0);
    expect(sells.length).toBeGreaterThan(0);
  });

  it("has records across multiple tickers", () => {
    const uniqueTickers = new Set(
      mockPerformanceRecords.map((r) => r.ticker),
    );
    expect(uniqueTickers.size).toBeGreaterThanOrEqual(5);
  });
});

describe("mockNoPerformanceRecords", () => {
  it("is an empty array", () => {
    expect(mockNoPerformanceRecords).toHaveLength(0);
  });
});
