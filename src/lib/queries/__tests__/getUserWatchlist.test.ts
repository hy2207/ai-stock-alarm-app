import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetCurrentUserId = vi.fn();
const mockFindMany = vi.fn();

vi.mock("@/lib/auth/getServerSession", () => ({
  getCurrentUserId: mockGetCurrentUserId,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    watchlist: {
      findMany: mockFindMany,
    },
  },
}));

describe("getUserWatchlist", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns an empty array when unauthenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const { getUserWatchlist } = await import("../getUserWatchlist");
    const result = await getUserWatchlist();

    expect(result).toEqual([]);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("returns ticker rows ordered by priority", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([
      { ticker: "NVDA", sector: null, priority: 1 },
      { ticker: "AAPL", sector: "Technology", priority: 2 },
    ]);

    const { getUserWatchlist } = await import("../getUserWatchlist");
    const result = await getUserWatchlist();

    expect(result).toEqual([
      { ticker: "NVDA", sector: null, priority: 1 },
      { ticker: "AAPL", sector: "Technology", priority: 2 },
    ]);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        ticker: { not: null },
      },
      orderBy: { priority: "asc" },
      select: {
        ticker: true,
        sector: true,
        priority: true,
      },
    });
  });

  it("reports whether the user has a watchlist", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindMany.mockResolvedValue([{ ticker: "AAPL", sector: null, priority: 1 }]);

    const { userHasWatchlist } = await import("../getUserWatchlist");
    await expect(userHasWatchlist()).resolves.toBe(true);
  });
});
