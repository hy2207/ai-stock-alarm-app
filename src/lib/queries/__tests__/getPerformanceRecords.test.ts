import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    performanceRecord: {
      findMany: mockFindMany,
    },
  },
}));

vi.mock("@/lib/auth/getServerSession", () => ({
  getCurrentUserId: vi.fn(),
}));

const { getCurrentUserId } = await import("@/lib/auth/getServerSession");
const mockGetCurrentUserId = vi.mocked(getCurrentUserId);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getPerformanceRecords", () => {
  it("returns empty array when user is unauthenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);
    const { getPerformanceRecords } = await import("../getPerformanceRecords");
    const result = await getPerformanceRecords();

    expect(result).toEqual([]);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("fetches records scoped to the authenticated user", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([
      {
        id: "rec-1",
        ticker: "AAPL",
        predictedDirection: "BUY",
        realizedReturn: 5.2,
        hitFlag: true,
        createdAt: new Date(),
      },
    ]);

    const { getPerformanceRecords } = await import("../getPerformanceRecords");
    const result = await getPerformanceRecords();

    expect(result).toHaveLength(1);
    expect(result[0].ticker).toBe("AAPL");
    expect(mockFindMany).toHaveBeenCalled();
  });

  it("limits to 30 most recent records within 30 days", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([]);

    const { getPerformanceRecords } = await import("../getPerformanceRecords");
    await getPerformanceRecords();

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.take).toBe(30);
    expect(callArgs.orderBy.createdAt).toBe("desc");
    expect(callArgs.where.createdAt.gte).toBeInstanceOf(Date);
  });

  it("includes both success and failure records", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([
      {
        id: "rec-1",
        ticker: "AAPL",
        predictedDirection: "BUY",
        realizedReturn: 5.2,
        hitFlag: true,
        createdAt: new Date(),
      },
      {
        id: "rec-2",
        ticker: "TSLA",
        predictedDirection: "SELL",
        realizedReturn: -3.1,
        hitFlag: false,
        createdAt: new Date(),
      },
    ]);

    const { getPerformanceRecords } = await import("../getPerformanceRecords");
    const result = await getPerformanceRecords();

    expect(result).toHaveLength(2);
    expect(result.filter((r) => r.hitFlag === true)).toHaveLength(1);
    expect(result.filter((r) => r.hitFlag === false)).toHaveLength(1);
  });

  it("returns empty array when no records exist", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([]);

    const { getPerformanceRecords } = await import("../getPerformanceRecords");
    const result = await getPerformanceRecords();

    expect(result).toEqual([]);
  });
});
