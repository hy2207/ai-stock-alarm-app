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

import { saveWatchlist } from "../saveWatchlist";
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

describe("saveWatchlist", () => {
  it("returns Unauthorized when no user session", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);
    const result = await saveWatchlist({ items: [{ ticker: "AAPL" }] });
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it("returns error for empty items array", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");
    const result = await saveWatchlist({ items: [] });
    expect(result).toEqual({ success: false, error: "Invalid watchlist data" });
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it("returns error for more than 3 items", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");
    const result = await saveWatchlist({
      items: [
        { ticker: "AAPL" },
        { ticker: "NVDA" },
        { ticker: "TSLA" },
        { ticker: "GOOGL" },
      ],
    });
    expect(result).toEqual({ success: false, error: "Invalid watchlist data" });
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it("GWT: Given ticker and sector are null When saving Then returns validation error without DB writes", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");

    const result = await saveWatchlist({
      items: [{ ticker: null, sector: null }],
    });

    expect(result).toEqual({ success: false, error: "Invalid watchlist data" });
    expect(mockDeleteMany).not.toHaveBeenCalled();
    expect(mockCreateMany).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("saves single ticker item", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");
    mockDeleteMany.mockResolvedValue({ count: 0 });
    mockCreateMany.mockResolvedValue({ count: 1 });
    const result = await saveWatchlist({ items: [{ ticker: "AAPL" }] });
    expect(result).toEqual({ success: true });
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { userId: "clxuser00000000001" },
    });
    expect(mockCreateMany).toHaveBeenCalledWith({
      data: [
        { userId: "clxuser00000000001", ticker: "AAPL", sector: null, priority: 1 },
      ],
    });
  });

  it("saves three mixed items", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");
    mockDeleteMany.mockResolvedValue({ count: 0 });
    mockCreateMany.mockResolvedValue({ count: 3 });
    const result = await saveWatchlist({
      items: [
        { ticker: "AAPL" },
        { sector: "Technology" },
        { ticker: "NVDA" },
      ],
    });
    expect(result).toEqual({ success: true });
    expect(mockCreateMany).toHaveBeenCalledWith({
      data: [
        { userId: "clxuser00000000001", ticker: "AAPL", sector: null, priority: 1 },
        { userId: "clxuser00000000001", ticker: null, sector: "Technology", priority: 2 },
        { userId: "clxuser00000000001", ticker: "NVDA", sector: null, priority: 3 },
      ],
    });
  });

  it("GWT: Given one sector item When saving Then stores sector with first priority", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");
    mockDeleteMany.mockResolvedValue({ count: 0 });
    mockCreateMany.mockResolvedValue({ count: 1 });

    const result = await saveWatchlist({
      items: [{ sector: "Healthcare" }],
    });

    expect(result).toEqual({ success: true });
    expect(mockCreateMany).toHaveBeenCalledWith({
      data: [
        {
          userId: "clxuser00000000001",
          ticker: null,
          sector: "Healthcare",
          priority: 1,
        },
      ],
    });
  });

  it("calls revalidatePath after success", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");
    mockDeleteMany.mockResolvedValue({ count: 0 });
    mockCreateMany.mockResolvedValue({ count: 1 });
    await saveWatchlist({ items: [{ ticker: "AAPL" }] });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
  });
});
