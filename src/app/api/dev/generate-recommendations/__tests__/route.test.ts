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

function makeRequest(body: Record<string, unknown> = {}): Request {
  return new Request("http://localhost/api/dev/generate-recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

describe("POST /api/dev/generate-recommendations", () => {
  it("returns 401 when the user is not authenticated", async () => {
    mockGetCurrentUserId.mockResolvedValue(null);

    const { POST } = await import("../route");
    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ error: "Unauthorized" });
  });

  it("returns generation summary JSON for authenticated users", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuserid00000000000001");
    mockGenerateRecommendationsForUser.mockResolvedValue({
      generatedCount: 3,
      skippedCount: 0,
      validationErrors: [],
      externalApiErrors: [],
    });

    const { POST } = await import("../route");
    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      generatedCount: 3,
      skippedCount: 0,
      validationErrors: [],
      externalApiErrors: [],
    });
    expect(mockGenerateRecommendationsForUser).toHaveBeenCalledWith(
      "clxuserid00000000000001",
      { force: false },
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("passes force=true when requested", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuserid00000000000001");
    mockGenerateRecommendationsForUser.mockResolvedValue({
      generatedCount: 2,
      skippedCount: 0,
      validationErrors: [],
      externalApiErrors: [],
    });

    const { POST } = await import("../route");
    await POST(makeRequest({ force: true }));

    expect(mockGenerateRecommendationsForUser).toHaveBeenCalledWith(
      "clxuserid00000000000001",
      { force: true },
    );
  });

  it("returns a failure stage when generation throws", async () => {
    mockGetCurrentUserId.mockResolvedValue("clxuserid00000000000001");
    mockGenerateRecommendationsForUser.mockRejectedValue(
      new Error("Gemini unavailable"),
    );

    const { POST } = await import("../route");
    const response = await POST(makeRequest());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Internal server error",
      stage: "generate_recommendations",
      message: "Gemini unavailable",
    });
  });

  it("returns a timeout stage when generation does not finish", async () => {
    vi.useFakeTimers();
    mockGetCurrentUserId.mockResolvedValue("clxuserid00000000000001");
    mockGenerateRecommendationsForUser.mockReturnValue(
      new Promise(() => undefined),
    );

    try {
      const { POST } = await import("../route");
      const pending = POST(makeRequest());

      await vi.advanceTimersByTimeAsync(56_000);
      const response = await pending;

      expect(response.status).toBe(500);
      expect(await response.json()).toMatchObject({
        error: "Internal server error",
        stage: "generation_timeout",
      });
    } finally {
      vi.useRealTimers();
    }
  });
});
