import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockGetCurrentUserId = vi.fn();
const mockFindMany = vi.fn();
const mockCount = vi.fn();

vi.mock("@/lib/auth/getServerSession", () => ({
  getCurrentUserId: mockGetCurrentUserId,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    recommendationCard: {
      findMany: mockFindMany,
      count: mockCount,
    },
  },
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-30T10:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const baseCard = {
  id: "clh789arcq01001",
  ticker: "NVDA",
  direction: "BUY" as const,
  entryPrice: 800.0,
  entryRangeLow: null,
  entryRangeHigh: null,
  targetPrice: 920.0,
  targetRangeLow: null,
  targetRangeHigh: null,
  stopPrice: null,
  holdDays: 5,
  confidenceScore: "aggressive" as const,
  reasonLine: "Strong AI demand outlook",
  status: "published" as const,
  createdAt: new Date("2026-05-25T08:00:00.000Z"),
  validUntil: new Date("2026-06-01T00:00:00.000Z"),
  performanceRecords: [] as Array<{
    hitFlag: boolean | null;
    realizedReturn: number | null;
    createdAt: Date;
  }>,
};

describe("getTickerHistory", () => {
  it("returns empty when user is not authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const { getTickerHistory } = await import("../getTickerHistory");
    const result = await getTickerHistory("NVDA");

    expect(result).toEqual({ items: [], totalCount: 0 });
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("returns empty when no cards for ticker", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const { getTickerHistory } = await import("../getTickerHistory");
    const result = await getTickerHistory("NVDA");

    expect(result).toEqual({ items: [], totalCount: 0 });
  });

  it("returns cards with performance data", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([
      {
        ...baseCard,
        performanceRecords: [
          { hitFlag: true, realizedReturn: 15.2, createdAt: new Date() },
        ],
      },
    ]);
    mockCount.mockResolvedValue(1);

    const { getTickerHistory } = await import("../getTickerHistory");
    const result = await getTickerHistory("NVDA");

    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].ticker).toBe("NVDA");
    expect(result.items[0].hitFlag).toBe(true);
    expect(result.items[0].realizedReturn).toBe(15.2);
    expect(
      (result.items[0] as Record<string, unknown>).userId,
    ).toBeUndefined();
  });

  it("returns null performance fields when no record exists", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([{ ...baseCard, performanceRecords: [] }]);
    mockCount.mockResolvedValue(1);

    const { getTickerHistory } = await import("../getTickerHistory");
    const result = await getTickerHistory("NVDA");

    expect(result.items[0].hitFlag).toBeNull();
    expect(result.items[0].realizedReturn).toBeNull();
  });

  it("uppercases the ticker parameter", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const { getTickerHistory } = await import("../getTickerHistory");
    await getTickerHistory("nvda");

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          ticker: "NVDA",
        }),
      }),
    );
  });

  it("limits to 50 results ordered by newest first", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const { getTickerHistory } = await import("../getTickerHistory");
    await getTickerHistory("AAPL");

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 50,
        orderBy: { createdAt: "desc" },
      }),
    );
  });
});
