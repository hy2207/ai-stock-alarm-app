import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  CLIENT_EVENT_NAMES,
  SERVER_EVENT_NAMES,
  ALL_EVENT_NAMES,
  eventNameSchema,
  clientEventNameSchema,
  serverEventNameSchema,
  EVENT_PROPERTY_SCHEMAS,
  type EventName,
} from "../../dto/posthogEvents";

// Mutable references for the posthog-node mock (hoist-safe pattern)
const phCapture = vi.fn();
const phFlush = vi.fn().mockResolvedValue(undefined);

class MockPostHog {
  capture = phCapture;
  flush = phFlush;
  shutdown = vi.fn().mockResolvedValue(undefined);
}

vi.mock("posthog-node", () => ({
  PostHog: MockPostHog,
}));

// ── Schema verification ─────────────────────────────────────────────

describe("PostHog event taxonomy", () => {
  it("has exactly 16 client event names", () => {
    expect(CLIENT_EVENT_NAMES).toHaveLength(16);
  });

  it("has exactly 3 server event names", () => {
    expect(SERVER_EVENT_NAMES).toHaveLength(3);
  });

  it("has exactly 19 total event names", () => {
    expect(ALL_EVENT_NAMES).toHaveLength(19);
  });

  it("every event name has a corresponding property schema", () => {
    for (const name of ALL_EVENT_NAMES) {
      expect(EVENT_PROPERTY_SCHEMAS[name as EventName]).toBeDefined();
    }
  });

  it("client event name schema rejects server events", () => {
    expect(clientEventNameSchema.safeParse("push_sent").success).toBe(false);
    expect(clientEventNameSchema.safeParse("rec_card_impression").success).toBe(true);
  });

  it("server event name schema rejects client events", () => {
    expect(serverEventNameSchema.safeParse("home_view").success).toBe(false);
    expect(serverEventNameSchema.safeParse("push_sent").success).toBe(true);
  });

  it("full event name schema accepts all event names", () => {
    for (const name of ALL_EVENT_NAMES) {
      expect(eventNameSchema.safeParse(name).success).toBe(true);
    }
  });

  it("full event name schema rejects unknown names", () => {
    expect(eventNameSchema.safeParse("invalid_event").success).toBe(false);
  });
});

// ── Server event capture ────────────────────────────────────────────

describe("captureServerEvent", () => {

  beforeEach(() => {
    vi.stubEnv("POSTHOG_API_KEY", "test-ph-key");
    vi.stubEnv("POSTHOG_HOST", "https://test.posthog.com");
    vi.stubEnv("VERCEL_ENV", "test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    phCapture.mockClear();
    phFlush.mockClear();
  });

  it("captures server event with system distinctId", async () => {
    const { captureServerEvent } = await import("../serverCapture");
    await captureServerEvent("push_sent", {
      recipientCount: 5,
      successCount: 4,
      failureCount: 1,
    });

    expect(phCapture).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "push_sent",
        distinctId: "system",
        properties: expect.objectContaining({
          recipientCount: 5,
          successCount: 4,
          failureCount: 1,
          $source: "server",
        }),
      }),
    );
    expect(phFlush).toHaveBeenCalled();
  });

  it("captures server event with custom distinctId", async () => {
    const { captureServerEvent } = await import("../serverCapture");
    await captureServerEvent(
      "llm_call_failed",
      { model: "gemini", errorType: "timeout", reason: "API timeout" },
      "user-abc",
    );
    expect(phCapture).toHaveBeenCalledWith(
      expect.objectContaining({
        distinctId: "user-abc",
        event: "llm_call_failed",
      }),
    );
  });

  it("silently handles missing env key (no-op)", async () => {
    vi.stubEnv("POSTHOG_API_KEY", "");
    const { captureServerEvent } = await import("../serverCapture");
    await expect(
      captureServerEvent("push_sent", { recipientCount: 1, successCount: 1, failureCount: 0 }),
    ).resolves.toBeUndefined();
  });

  it("silently handles invalid event name (no-op)", async () => {
    const { captureServerEvent } = await import("../serverCapture");
    await expect(captureServerEvent("home_view" as any, {} as any)).resolves.toBeUndefined();
    expect(phCapture).not.toHaveBeenCalled();
  });
});

// ── Client event capture ────────────────────────────────────────────

describe("createClientEventCapturers", () => {
  it("returns all 17 capture functions (16 named + 1 generic)", async () => {
    const { createClientEventCapturers } = await import("../useClientEvent");
    const cap = createClientEventCapturers(vi.fn());
    const fnNames = Object.keys(cap);
    expect(fnNames).toContain("captureEvent");
    expect(fnNames).toContain("captureHomeView");
    expect(fnNames).toContain("captureRecCardImpression");
    expect(fnNames).toContain("captureRecCardClick");
    expect(fnNames).toContain("captureRecDetailView");
    expect(fnNames).toContain("captureBookmarkAdd");
    expect(fnNames).toContain("captureAlertSet");
    expect(fnNames).toContain("captureBrokerRedirect");
    expect(fnNames).toContain("capturePriceCopy");
    expect(fnNames).toContain("captureExecutionIntentSubmit");
    expect(fnNames).toContain("captureConfidenceView");
    expect(fnNames).toContain("captureConfidenceChange");
    expect(fnNames).toContain("capturePerformanceCardView");
    expect(fnNames).toContain("captureReasonExpand");
    expect(fnNames).toContain("capturePushOpen");
    expect(fnNames).toContain("captureDeeplinkSuccess");
    expect(fnNames).toContain("captureDeeplinkFail");
    expect(fnNames).toHaveLength(17);
  });

  it("generic captureEvent sends any event name", async () => {
    const mock = vi.fn();
    const { createClientEventCapturers } = await import("../useClientEvent");
    const cap = createClientEventCapturers(mock);
    cap.captureEvent("home_view", { source: "manual" });
    expect(mock).toHaveBeenCalledWith("home_view", { source: "manual" });
  });
});

// ── No /api/events endpoint ─────────────────────────────────────────

describe("/api/events endpoint", () => {
  it("does NOT exist", async () => {
    // Use fs to check file existence instead of import to avoid TS2307
    const fs = await import("fs");
    const path = await import("path");
    const eventsRoute = path.resolve(
      __dirname,
      "../../../app/api/events/route.ts",
    );
    expect(fs.existsSync(eventsRoute)).toBe(false);
  });
});
