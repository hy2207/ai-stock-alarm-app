import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockGetCurrentUserId = vi.fn();
const mockFindMany = vi.fn();
const mockCount = vi.fn();

vi.mock("@/lib/auth/getServerSession", () => ({
  getCurrentUserId: mockGetCurrentUserId,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    performanceRecord: {
      findMany: mockFindMany,
      count: mockCount,
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

const validRecord = {
  id: "clh789perf000001",
  recId: "clh789perf000002",
  ticker: "NVDA",
  predictedDirection: "BUY" as const,
  realizedReturn: 12.5,
  hitFlag: true,
  evaluationWindowDays: 5,
  evaluatedAt: new Date("2026-05-29T10:00:00.000Z"),
  createdAt: new Date("2026-05-25T08:00:00.000Z"),
};

describe("getPerformanceRecords", () => {
  it("returns empty when user is not authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const { getPerformanceRecords } = await import("../getPerformanceRecords");
    const result = await getPerformanceRecords();

    expect(result).toEqual({ records: [], totalCount: 0 });
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("returns empty when no records exist", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const { getPerformanceRecords } = await import("../getPerformanceRecords");
    const result = await getPerformanceRecords();

    expect(result).toEqual({ records: [], totalCount: 0 });
  });

  it("returns records and totalCount when records exist", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([validRecord]);
    mockCount.mockResolvedValue(1);

    const { getPerformanceRecords } = await import("../getPerformanceRecords");
    const result = await getPerformanceRecords();

    expect(result.totalCount).toBe(1);
    expect(result.records).toHaveLength(1);
    expect(result.records[0].ticker).toBe("NVDA");
    expect(result.records[0].hitFlag).toBe(true);
    expect(result.records[0].realizedReturn).toBe(12.5);
  });

  it("limits to 30 records and orders by createdAt desc", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const { getPerformanceRecords } = await import("../getPerformanceRecords");
    await getPerformanceRecords();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 30,
        orderBy: { createdAt: "desc" },
      }),
    );
  });

  it("filters to last 30 days in query", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const { getPerformanceRecords } = await import("../getPerformanceRecords");
    await getPerformanceRecords();

    const callArgs = mockFindMany.mock.calls[0][0];
    const gte = callArgs.where.createdAt.gte;
    expect(gte.getTime()).toBeGreaterThanOrEqual(
      new Date("2026-04-30T10:00:00.000Z").getTime(),
    );
  });

  it("includes both hit and miss records", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([
      validRecord,
      { ...validRecord, id: "clh789perf000003", hitFlag: false, realizedReturn: -5.2 },
    ]);
    mockCount.mockResolvedValue(2);

    const { getPerformanceRecords } = await import("../getPerformanceRecords");
    const result = await getPerformanceRecords();

    expect(result.records).toHaveLength(2);
    expect(result.records.some((r) => r.hitFlag === false)).toBe(true);
    expect(result.records.some((r) => r.hitFlag === true)).toBe(true);
  });
});
