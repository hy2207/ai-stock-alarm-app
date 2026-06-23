import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRunPerformanceEvaluation = vi.fn();
const mockCaptureServerEvent = vi.fn();

vi.mock("@/lib/perf/evaluatePerformance", () => ({
  runPerformanceEvaluation: mockRunPerformanceEvaluation,
}));

vi.mock("@/lib/analytics/serverCapture", () => ({
  captureServerEvent: mockCaptureServerEvent,
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CRON_SECRET", "test-secret");
});

function makeRequest(authHeader?: string) {
  return new Request("http://localhost/api/cron/evaluate-performance", {
    headers: authHeader ? { authorization: authHeader } : {},
  }) as unknown as import("next/server").NextRequest;
}

describe("GET /api/cron/evaluate-performance", () => {
  it("returns 401 when authorization header is missing", async () => {
    const { GET } = await import("../route");
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 401 when secret is wrong", async () => {
    const { GET } = await import("../route");
    const res = await GET(makeRequest("Bearer wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("GWT: Given valid auth When evaluation succeeds Then returns evaluated counts", async () => {
    mockRunPerformanceEvaluation.mockResolvedValue({
      evaluated: 3,
      skipped: 1,
      errors: [],
    });

    const { GET } = await import("../route");
    const res = await GET(makeRequest("Bearer test-secret"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ evaluated: 3, skipped: 1, errors: [] });
  });

  it("GWT: Given valid auth When evaluation throws Then returns 500", async () => {
    mockRunPerformanceEvaluation.mockRejectedValue(new Error("DB down"));

    const { GET } = await import("../route");
    const res = await GET(makeRequest("Bearer test-secret"));

    expect(res.status).toBe(500);
  });

  it("captures server analytics event on success", async () => {
    mockRunPerformanceEvaluation.mockResolvedValue({
      evaluated: 2,
      skipped: 0,
      errors: [],
    });

    const { GET } = await import("../route");
    await GET(makeRequest("Bearer test-secret"));

    expect(mockCaptureServerEvent).toHaveBeenCalledWith(
      "performance_evaluation_run",
      expect.objectContaining({ evaluated: 2, skipped: 0, errors: 0 }),
    );
  });
});
