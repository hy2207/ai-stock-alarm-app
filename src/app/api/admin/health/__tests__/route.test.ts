import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildHealthResponse } from "@/lib/admin/health";

describe("admin health route", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("GWT: Given no source timestamps When building health response Then reports never collected", () => {
    vi.stubEnv("LAST_YAHOO_FINANCE_SYNC_AT", "");
    vi.stubEnv("LAST_FINNHUB_SYNC_AT", "");
    vi.stubEnv("MARKET_DATA_NULL_RATE", "0");

    expect(buildHealthResponse()).toEqual({
      freshness: {
        yahooFinance: null,
        finnhub: null,
      },
      nullRate: 0,
    });
  });

  it("GWT: Given recent source timestamps When building health response Then returns non-negative freshness", () => {
    const now = new Date("2026-06-19T00:10:00.000Z");
    vi.setSystemTime(now);
    vi.stubEnv("LAST_YAHOO_FINANCE_SYNC_AT", "2026-06-19T00:05:00.000Z");
    vi.stubEnv("LAST_FINNHUB_SYNC_AT", "2026-06-19T00:00:00.000Z");
    vi.stubEnv("MARKET_DATA_NULL_RATE", "1.5");

    expect(buildHealthResponse()).toEqual({
      freshness: {
        yahooFinance: 5,
        finnhub: 10,
      },
      nullRate: 1.5,
    });
  });
});
