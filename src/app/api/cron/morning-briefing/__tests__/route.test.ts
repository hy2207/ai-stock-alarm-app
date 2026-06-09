import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindMany = vi.fn();
const mockUpdateMany = vi.fn();
const mockCaptureServerEvent = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: mockFindMany,
      updateMany: mockUpdateMany,
    },
  },
}));

vi.mock("@/lib/analytics/serverCapture", () => ({
  captureServerEvent: mockCaptureServerEvent,
}));

beforeEach(() => {
  vi.stubEnv("CRON_SECRET", "test-cron-secret");
  vi.stubEnv("ONESIGNAL_APP_ID", "test-app-id");
  vi.stubEnv("ONESIGNAL_REST_API_KEY", "test-api-key");
  mockUpdateMany.mockResolvedValue({ count: 0 });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function createRequest(auth?: string): NextRequest {
  return {
    headers: new Map(
      auth ? [["authorization", auth]] : [],
    ) as unknown as Headers,
  } as any;
}

describe("GET /api/cron/morning-briefing", () => {
  it("returns 401 when CRON_SECRET is missing", async () => {
    const { GET } = await import("../route");
    const response = await GET(createRequest());

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when CRON_SECRET is wrong", async () => {
    const { GET } = await import("../route");
    const response = await GET(createRequest("Bearer wrong-secret"));

    expect(response.status).toBe(401);
  });

  it("returns 401 when CRON_SECRET env var is unset", async () => {
    vi.stubEnv("CRON_SECRET", "");

    const { GET } = await import("../route");
    const response = await GET(createRequest("Bearer test-cron-secret"));

    expect(response.status).toBe(401);
  });

  it("returns scheduled=0 when no consenting users", async () => {
    mockFindMany.mockResolvedValue([]);

    const { GET } = await import("../route");
    const response = await GET(createRequest("Bearer test-cron-secret"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ scheduled: 0, sent: 0, failed: 0 });
  });

  it("sends push for consenting users and returns success", async () => {
    mockFindMany.mockResolvedValue([
      { id: "user-1" },
      { id: "user-2" },
      { id: "user-3" },
    ]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: "onesignal-notif-001", recipients: 3 }),
      }),
    );

    const { GET } = await import("../route");
    const response = await GET(createRequest("Bearer test-cron-secret"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.scheduled).toBe(3);
    expect(body.sent).toBe(3);
    expect(body.failed).toBe(0);

    expect(mockCaptureServerEvent).toHaveBeenCalledWith("push_sent", {
      scheduled: 3,
      sent: 3,
      failed: 0,
      oneSignalNotificationId: "onesignal-notif-001",
      invalidExternalUserIds: 0,
    });
  });

  it("returns failed count when OneSignal API fails", async () => {
    mockFindMany.mockResolvedValue([{ id: "user-1" }]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ errors: ["Invalid app_id"] }),
      }),
    );

    const { GET } = await import("../route");
    const response = await GET(createRequest("Bearer test-cron-secret"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.scheduled).toBe(1);
    expect(body.sent).toBe(0);
    expect(body.failed).toBe(1);
  });

  it("returns 500 when OneSignal env vars are missing", async () => {
    vi.stubEnv("ONESIGNAL_APP_ID", "");
    mockFindMany.mockResolvedValue([{ id: "user-1" }]);

    const { GET } = await import("../route");
    const response = await GET(createRequest("Bearer test-cron-secret"));

    expect(response.status).toBe(500);
  });

  it("marks invalid external user IDs as consentPush=false", async () => {
    mockFindMany.mockResolvedValue([
      { id: "user-valid" },
      { id: "user-revoked" },
    ]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "onesignal-notif-002",
          recipients: 1,
          invalid_external_user_ids: ["user-revoked"],
        }),
      }),
    );

    const { GET } = await import("../route");
    const response = await GET(createRequest("Bearer test-cron-secret"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.scheduled).toBe(2);
    expect(body.sent).toBe(2);
    expect(body.failed).toBe(0);

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: { in: ["user-revoked"] } },
      data: { consentPush: false },
    });
  });
});
