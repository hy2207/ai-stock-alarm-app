import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    recommendationCard: {
      findFirst: mockFindFirst,
      findMany: mockFindMany,
    },
  },
}));

const NOW = new Date("2026-05-30T10:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function createRequest(): NextRequest {
  return { headers: new Map() } as unknown as NextRequest;
}

describe("GET /api/admin/health", () => {
  it("returns null freshness when no cards exist", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockFindMany.mockResolvedValue([]);

    const { GET } = await import("../route");
    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.freshness.yahooFinance).toBeNull();
    expect(body.freshness.finnhub).toBeNull();
    expect(body.nullRate).toBe(0);
  });

  it("returns computed freshness from latest card", async () => {
    const cardDate = new Date(NOW.getTime() - 30 * 60_000);
    mockFindFirst.mockResolvedValue({ createdAt: cardDate });
    mockFindMany.mockResolvedValue([
      { entryPrice: 150, entryRangeLow: null, targetPrice: 160, targetRangeLow: null, reasonLine: "Test" },
    ]);

    const { GET } = await import("../route");
    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.freshness.yahooFinance).toBe(30);
    expect(body.freshness.finnhub).toBe(30);
  });

  it("reports nullRate from recent cards", async () => {
    const cardDate = new Date(NOW.getTime() - 10 * 60_000);
    mockFindFirst.mockResolvedValue({ createdAt: cardDate });
    mockFindMany.mockResolvedValue([
      { entryPrice: 150, entryRangeLow: null, targetPrice: 160, targetRangeLow: null, reasonLine: "Good" },
      { entryPrice: null, entryRangeLow: null, targetPrice: null, targetRangeLow: null, reasonLine: "" },
      { entryPrice: 200, entryRangeLow: null, targetPrice: 210, targetRangeLow: null, reasonLine: "Strong" },
      { entryPrice: null, entryRangeLow: null, targetPrice: null, targetRangeLow: null, reasonLine: "" },
    ]);

    const { GET } = await import("../route");
    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.nullRate).toBe(50);
  });

  it("returns nullRate=0 for perfectly hydrated cards", async () => {
    const cardDate = new Date(NOW.getTime() - 5 * 60_000);
    mockFindFirst.mockResolvedValue({ createdAt: cardDate });
    mockFindMany.mockResolvedValue([
      { entryPrice: 100, entryRangeLow: null, targetPrice: 110, targetRangeLow: null, reasonLine: "A" },
      { entryPrice: 200, entryRangeLow: null, targetPrice: 190, targetRangeLow: null, reasonLine: "B" },
    ]);

    const { GET } = await import("../route");
    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.nullRate).toBe(0);
  });

  it("excludes no_call cards from nullRate calculation", async () => {
    const cardDate = new Date(NOW.getTime() - 15 * 60_000);
    mockFindFirst.mockResolvedValue({ createdAt: cardDate });
    mockFindMany.mockResolvedValue([
      { entryPrice: 150, entryRangeLow: null, targetPrice: 155, targetRangeLow: null, reasonLine: "Trending" },
    ]);

    const { GET } = await import("../route");
    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.nullRate).toBe(0);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: { not: "no_call" } }),
      }),
    );
  });
});
