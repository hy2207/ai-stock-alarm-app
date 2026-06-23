import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../auth/getServerSession", () => ({
  getCurrentUserId: vi.fn(),
}));

vi.mock("../../prisma", () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { savePushConsent } from "../savePushConsent";
import { getCurrentUserId } from "../../auth/getServerSession";
import { prisma } from "../../prisma";
import { revalidatePath } from "next/cache";

const mockGetCurrentUserId = vi.mocked(getCurrentUserId);
const mockUpdate = vi.mocked(prisma.user.update);
const mockRevalidatePath = vi.mocked(revalidatePath);

function makeFormData(consent: string) {
  const fd = new FormData();
  fd.set("consent", consent);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("savePushConsent", () => {
  it("returns Unauthorized when no session", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);
    const result = await savePushConsent(makeFormData("true"));
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error for invalid consent value", async () => {
    mockGetCurrentUserId.mockResolvedValue("user1");
    const result = await savePushConsent(makeFormData("yes"));
    expect(result).toEqual({ success: false, error: "Invalid consent value" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('GWT: Given authenticated user When consent is "true" Then sets consentPush=true', async () => {
    mockGetCurrentUserId.mockResolvedValue("user1");
    mockUpdate.mockResolvedValue({} as never);

    const result = await savePushConsent(makeFormData("true"));

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user1" },
      data: { consentPush: true },
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/settings");
  });

  it('GWT: Given authenticated user When consent is "false" Then sets consentPush=false', async () => {
    mockGetCurrentUserId.mockResolvedValue("user1");
    mockUpdate.mockResolvedValue({} as never);

    const result = await savePushConsent(makeFormData("false"));

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user1" },
      data: { consentPush: false },
    });
  });
});
