import { afterEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUserId = vi.fn();
const mockGenerateRecommendationsForUser = vi.fn();
const mockRevalidatePath = vi.fn();

vi.mock("@/lib/auth/getServerSession", () => ({
  getCurrentUserId: mockGetCurrentUserId,
}));

vi.mock("@/lib/recommendations/generateRecommendationsForUser", () => ({
  generateRecommendationsForUser: mockGenerateRecommendationsForUser,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

describe("POST /api/dev/generate-recommendations", () => {
  it("returns 404 in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const { POST } = await import("../route");
    const response = await POST();

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Not found" });
  });

  it("returns 401 when the user is not authenticated", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mockGetCurrentUserId.mockResolvedValue(null);

    const { POST } = await import("../route");
    const response = await POST();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Unauthorized",
      stage: "auth_session",
      hint:
        "Clear localhost:3000 cookies and sign in again if NEXTAUTH_SECRET changed.",
    });
  });

  it("returns generation summary JSON for authenticated development users", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mockGetCurrentUserId.mockResolvedValue("clxuserid00000000000001");
    mockGenerateRecommendationsForUser.mockResolvedValue({
      generatedCount: 3,
      skippedCount: 0,
      validationErrors: [],
      externalApiErrors: [],
    });

    const { POST } = await import("../route");
    const response = await POST();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      generatedCount: 3,
      skippedCount: 0,
      validationErrors: [],
      externalApiErrors: [],
    });
    expect(mockGenerateRecommendationsForUser).toHaveBeenCalledWith(
      "clxuserid00000000000001",
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("returns a development failure stage when generation throws", async () => {
    vi.stubEnv("NODE_ENV", "development");
    mockGetCurrentUserId.mockResolvedValue("clxuserid00000000000001");
    mockGenerateRecommendationsForUser.mockRejectedValue(
      new Error("Gemini unavailable"),
    );

    const { POST } = await import("../route");
    const response = await POST();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Internal server error",
      stage: "generate_recommendations",
      message: "Gemini unavailable",
    });
  });
});
