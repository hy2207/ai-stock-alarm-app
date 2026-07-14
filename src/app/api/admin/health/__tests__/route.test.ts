import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockQueryRaw = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { $queryRaw: mockQueryRaw },
}));

describe("admin health route", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockQueryRaw.mockResolvedValue([{ "?column?": 1 }]);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it("GWT: Given no source timestamps When building health response Then reports never collected", async () => {
    vi.stubEnv("LAST_YAHOO_FINANCE_SYNC_AT", "");
    vi.stubEnv("LAST_FINNHUB_SYNC_AT", "");
    vi.stubEnv("MARKET_DATA_NULL_RATE", "0");

    const { buildHealthResponse } = await import("@/lib/admin/health");
    await expect(buildHealthResponse()).resolves.toEqual({
      freshness: {
        yahooFinance: null,
        finnhub: null,
      },
      nullRate: 0,
      db: { connected: true, latencyMs: 0 },
    });
  });

  it("GWT: Given recent source timestamps When building health response Then returns non-negative freshness", async () => {
    const now = new Date("2026-06-19T00:10:00.000Z");
    vi.setSystemTime(now);
    vi.stubEnv("LAST_YAHOO_FINANCE_SYNC_AT", "2026-06-19T00:05:00.000Z");
    vi.stubEnv("LAST_FINNHUB_SYNC_AT", "2026-06-19T00:00:00.000Z");
    vi.stubEnv("MARKET_DATA_NULL_RATE", "1.5");

    const { buildHealthResponse } = await import("@/lib/admin/health");
    await expect(buildHealthResponse()).resolves.toEqual({
      freshness: {
        yahooFinance: 5,
        finnhub: 10,
      },
      nullRate: 1.5,
      db: { connected: true, latencyMs: 0 },
    });
  });

  it("GWT: Given an unreachable database When building health response Then reports db disconnected", async () => {
    vi.stubEnv("MARKET_DATA_NULL_RATE", "0");
    mockQueryRaw.mockRejectedValue(new Error("connection refused"));

    const { buildHealthResponse } = await import("@/lib/admin/health");
    const result = await buildHealthResponse();
    expect(result.db).toEqual({ connected: false, latencyMs: null });
  });
});
