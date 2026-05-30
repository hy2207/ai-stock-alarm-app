import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockGetCurrentUserId = vi.fn();
const mockFindUnique = vi.fn();

vi.mock("@/lib/auth/getServerSession", () => ({
  getCurrentUserId: mockGetCurrentUserId,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    riskProfile: {
      findUnique: mockFindUnique,
    },
  },
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getRiskProfile", () => {
  it("returns null when user is not authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const { getRiskProfile } = await import("../getRiskProfile");
    const result = await getRiskProfile();

    expect(result).toBeNull();
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns null when no risk profile exists", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindUnique.mockResolvedValue(null);

    const { getRiskProfile } = await import("../getRiskProfile");
    const result = await getRiskProfile();

    expect(result).toBeNull();
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { userId: "user-1" } });
  });

  it("returns the risk profile when it exists", async () => {
    const fakeProfile = {
      id: "rp-1",
      userId: "user-1",
      riskMode: "aggressive" as const,
      updatedAt: new Date("2026-05-30T10:00:00.000Z"),
    };
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockFindUnique.mockResolvedValue(fakeProfile);

    const { getRiskProfile } = await import("../getRiskProfile");
    const result = await getRiskProfile();

    expect(result).toEqual(fakeProfile);
    expect(result?.riskMode).toBe("aggressive");
  });

  it("returns balanced risk profile", async () => {
    const fakeProfile = {
      id: "rp-2",
      userId: "user-2",
      riskMode: "balanced" as const,
      updatedAt: new Date("2026-05-30T11:00:00.000Z"),
    };
    mockGetCurrentUserId.mockResolvedValue("user-2");
    mockFindUnique.mockResolvedValue(fakeProfile);

    const { getRiskProfile } = await import("../getRiskProfile");
    const result = await getRiskProfile();

    expect(result?.riskMode).toBe("balanced");
  });

  it("returns conservative risk profile", async () => {
    const fakeProfile = {
      id: "rp-3",
      userId: "user-3",
      riskMode: "conservative" as const,
      updatedAt: new Date("2026-05-30T12:00:00.000Z"),
    };
    mockGetCurrentUserId.mockResolvedValue("user-3");
    mockFindUnique.mockResolvedValue(fakeProfile);

    const { getRiskProfile } = await import("../getRiskProfile");
    const result = await getRiskProfile();

    expect(result?.riskMode).toBe("conservative");
  });
});
