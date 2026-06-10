import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../auth/getServerSession", () => ({
  getCurrentUserId: vi.fn(),
}));

vi.mock("../../prisma", () => ({
  prisma: {
    watchlist: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { updateWatchlist } from "../updateWatchlist";
import { getCurrentUserId } from "../../auth/getServerSession";
import { prisma } from "../../prisma";
import { revalidatePath } from "next/cache";

const mockGetCurrentUserId = vi.mocked(getCurrentUserId);
const mockDeleteMany = vi.mocked(prisma.watchlist.deleteMany);
const mockCreateMany = vi.mocked(prisma.watchlist.createMany);
const mockRevalidatePath = vi.mocked(revalidatePath);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateWatchlist", () => {
  it("returns Unauthorized when no user session is available", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const result = await updateWatchlist({ items: [{ ticker: "AAPL" }] });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDeleteMany).not.toHaveBeenCalled();
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("rejects empty watchlist updates", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");

    const result = await updateWatchlist({ items: [] });

    expect(result).toEqual({ success: false, error: "Invalid watchlist data" });
    expect(mockDeleteMany).not.toHaveBeenCalled();
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("rejects updates with more than three watchlist items", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");

    const result = await updateWatchlist({
      items: [
        { ticker: "AAPL" },
        { ticker: "NVDA" },
        { ticker: "TSLA" },
        { sector: "Technology" },
      ],
    });

    expect(result).toEqual({ success: false, error: "Invalid watchlist data" });
    expect(mockDeleteMany).not.toHaveBeenCalled();
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("replaces the authenticated user's existing watchlist with prioritized items", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");
    mockDeleteMany.mockResolvedValue({ count: 2 });
    mockCreateMany.mockResolvedValue({ count: 3 });

    const result = await updateWatchlist({
      items: [
        { ticker: "AAPL" },
        { sector: "Technology" },
        { ticker: "NVDA" },
      ],
    });

    expect(result).toEqual({ success: true });
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { userId: "clxuser00000000001" },
    });
    expect(mockCreateMany).toHaveBeenCalledWith({
      data: [
        { userId: "clxuser00000000001", ticker: "AAPL", sector: null, priority: 1 },
        { userId: "clxuser00000000001", ticker: null, sector: "Technology", priority: 2 },
        { userId: "clxuser00000000001", ticker: "NVDA", sector: null, priority: 3 },
      ],
    });
  });

  it("revalidates home and settings surfaces after a successful update", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");
    mockDeleteMany.mockResolvedValue({ count: 1 });
    mockCreateMany.mockResolvedValue({ count: 1 });

    await updateWatchlist({ items: [{ ticker: "MSFT" }] });

    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/settings");
  });
});
