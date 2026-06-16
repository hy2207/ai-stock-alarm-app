import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

const mockCapture = vi.fn();
const mockFlush = vi.fn().mockResolvedValue(undefined);
const mockShutdown = vi.fn().mockResolvedValue(undefined);

vi.mock("posthog-node", () => ({
  PostHog: vi.fn(function () {
    return {
      capture: mockCapture,
      flush: mockFlush,
      shutdown: mockShutdown,
    };
  }),
}));

beforeEach(() => {
  vi.stubEnv("POSTHOG_API_KEY", "test-key");
  vi.stubEnv("POSTHOG_HOST", "https://app.posthog.com");
  mockCapture.mockClear();
  mockFlush.mockClear();
  mockShutdown.mockClear();
});

afterEach(async () => {
  const { shutdownAnalytics } = await import("../serverCapture");
  await shutdownAnalytics();
  vi.unstubAllEnvs();
});

describe("captureServerEvent", () => {
  it("captures a valid server event with default distinctId", async () => {
    const { captureServerEvent } = await import("../serverCapture");
    await captureServerEvent("llm_call_failed", { reason: "timeout" });
    expect(mockCapture).toHaveBeenCalledWith(
      expect.objectContaining({
        distinctId: "system",
        event: "llm_call_failed",
        properties: expect.objectContaining({ reason: "timeout", $source: "server" }),
      }),
    );
  });

  it("captures an event with custom distinctId", async () => {
    const { captureServerEvent } = await import("../serverCapture");
    await captureServerEvent("push_sent", undefined, "user_clx123");
    expect(mockCapture).toHaveBeenCalledWith(
      expect.objectContaining({ distinctId: "user_clx123", event: "push_sent" }),
    );
  });

  it("handles rec_validation_failed event", async () => {
    const { captureServerEvent } = await import("../serverCapture");
    await captureServerEvent("rec_validation_failed", {
      recId: "rec_abc",
      error: "holdDays out of range",
    });
    expect(mockCapture).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "rec_validation_failed",
        properties: expect.objectContaining({ recId: "rec_abc" }),
      }),
    );
  });

  it("silently skips when POSTHOG_API_KEY is unset", async () => {
    vi.stubEnv("POSTHOG_API_KEY", "");
    const { captureServerEvent } = await import("../serverCapture");
    await captureServerEvent("llm_call_failed", { reason: "timeout" });
    expect(mockCapture).not.toHaveBeenCalled();
  });

  it("rejects an invalid server event name gracefully", async () => {
    const { captureServerEvent } = await import("../serverCapture");
    await captureServerEvent("home_view" as never);
    expect(mockCapture).not.toHaveBeenCalled();
  });

  it("calls flush after capture", async () => {
    const { captureServerEvent } = await import("../serverCapture");
    await captureServerEvent("push_sent");
    expect(mockFlush).toHaveBeenCalled();
  });
});
