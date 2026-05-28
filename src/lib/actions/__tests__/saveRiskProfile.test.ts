import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../auth/getServerSession", () => ({
  getCurrentUserId: vi.fn(),
}));

vi.mock("../../prisma", () => ({
  prisma: {
    riskProfile: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { saveRiskProfile } from "../saveRiskProfile";
import { getCurrentUserId } from "../../auth/getServerSession";
import { prisma } from "../../prisma";
import { revalidatePath } from "next/cache";

const mockGetCurrentUserId = vi.mocked(getCurrentUserId);
const mockUpsert = vi.mocked(prisma.riskProfile.upsert);
const mockRevalidatePath = vi.mocked(revalidatePath);

function createFormData(riskMode: string): FormData {
  const fd = new FormData();
  fd.set("riskMode", riskMode);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("saveRiskProfile", () => {
  it("returns Unauthorized when no user session", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);
    const result = await saveRiskProfile(createFormData("balanced"));
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("returns Invalid riskMode for disallowed value", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");
    const result = await saveRiskProfile(createFormData("invalid_mode"));
    expect(result).toEqual({ success: false, error: "Invalid riskMode" });
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("upserts RiskProfile with aggressive mode", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");
    mockUpsert.mockResolvedValue({} as never);
    const result = await saveRiskProfile(createFormData("aggressive"));
    expect(result).toEqual({ success: true });
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { userId: "clxuser00000000001" },
      create: { userId: "clxuser00000000001", riskMode: "aggressive" },
      update: { riskMode: "aggressive" },
    });
  });

  it("upserts RiskProfile with balanced mode", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");
    mockUpsert.mockResolvedValue({} as never);
    const result = await saveRiskProfile(createFormData("balanced"));
    expect(result).toEqual({ success: true });
    expect(mockUpsert).toHaveBeenCalled();
  });

  it("upserts RiskProfile with conservative mode", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");
    mockUpsert.mockResolvedValue({} as never);
    const result = await saveRiskProfile(createFormData("conservative"));
    expect(result).toEqual({ success: true });
    expect(mockUpsert).toHaveBeenCalled();
  });

  it("calls revalidatePath after successful upsert", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuser00000000001");
    mockUpsert.mockResolvedValue({} as never);
    await saveRiskProfile(createFormData("balanced"));
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
  });


});
