import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetCurrentUserId = vi.fn();
const mockUserDelete = vi.fn();

vi.mock("../../auth/getServerSession", () => ({
  getCurrentUserId: mockGetCurrentUserId,
}));

vi.mock("../../prisma", () => ({
  prisma: {
    user: {
      delete: mockUserDelete,
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("deleteAccount", () => {
  it("deletes the user and returns success when authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-clx-001");
    mockUserDelete.mockResolvedValue({ id: "user-clx-001" });

    const { deleteAccount } = await import("../deleteAccount");
    const result = await deleteAccount();

    expect(result).toEqual({ success: true });
    expect(mockUserDelete).toHaveBeenCalledWith({
      where: { id: "user-clx-001" },
    });
  });

  it("returns success false when no user is logged in", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const { deleteAccount } = await import("../deleteAccount");
    const result = await deleteAccount();

    expect(result).toEqual({ success: false });
    expect(mockUserDelete).not.toHaveBeenCalled();
  });

  it("returns success false when prisma delete throws", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-clx-001");
    mockUserDelete.mockRejectedValue(new Error("DB error"));

    const { deleteAccount } = await import("../deleteAccount");
    const result = await deleteAccount();

    expect(result).toEqual({ success: false });
  });
});
