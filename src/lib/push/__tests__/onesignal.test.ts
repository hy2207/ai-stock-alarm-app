import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function createMockOneSignal() {
  return {
    init: vi.fn().mockResolvedValue(undefined),
    User: {
      PushSubscription: {
        optIn: vi.fn().mockResolvedValue(undefined),
        optOut: vi.fn().mockResolvedValue(undefined),
        getIdAsync: vi.fn().mockResolvedValue("onesignal_player_abc123"),
      },
    },
  };
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_ONESIGNAL_APP_ID", "test-app-id");
  vi.stubEnv("NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID", "test-safari-id");
  // Simulate browser environment (module guards on typeof window)
  if (typeof (globalThis as Record<string, unknown>).window === "undefined") {
    (globalThis as Record<string, unknown>).window = globalThis as unknown as Window & typeof globalThis;
  }
});

afterEach(() => {
  vi.unstubAllEnvs();
  const win = globalThis as Record<string, unknown>;
  delete win.OneSignalDeferred;
  delete win.OneSignal;
});

describe("initOneSignal", () => {
  it("sets up OneSignalDeferred and pushes init callback", async () => {
    const { initOneSignal } = await import("../onesignal");
    initOneSignal();

    const win = globalThis as Record<string, unknown>;
    expect(Array.isArray(win.OneSignalDeferred)).toBe(true);
    expect(win.OneSignalDeferred).toHaveLength(1);
    expect(typeof (win.OneSignalDeferred as unknown[])[0]).toBe("function");
  });

  it("no-ops when NEXT_PUBLIC_ONESIGNAL_APP_ID is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_ONESIGNAL_APP_ID", "");

    const { initOneSignal } = await import("../onesignal");
    initOneSignal();

    const win = globalThis as Record<string, unknown>;
    expect(win.OneSignalDeferred).toBeUndefined();
  });
});

describe("subscribePush", () => {
  it("calls OneSignal.User.PushSubscription.optIn", async () => {
    const mockOneSignal = createMockOneSignal();
    const win = globalThis as Record<string, unknown>;
    win.OneSignal = mockOneSignal;

    const { subscribePush } = await import("../onesignal");
    await subscribePush();

    expect(mockOneSignal.User.PushSubscription.optIn).toHaveBeenCalledOnce();
  });

  it("no-ops when OneSignal is not initialised", async () => {
    const { subscribePush } = await import("../onesignal");
    await expect(subscribePush()).resolves.toBe(false);
  });
});

describe("unsubscribePush", () => {
  it("calls OneSignal.User.PushSubscription.optOut", async () => {
    const mockOneSignal = createMockOneSignal();
    const win = globalThis as Record<string, unknown>;
    win.OneSignal = mockOneSignal;

    const { unsubscribePush } = await import("../onesignal");
    await unsubscribePush();

    expect(mockOneSignal.User.PushSubscription.optOut).toHaveBeenCalledOnce();
  });

  it("no-ops when OneSignal is not initialised", async () => {
    const { unsubscribePush } = await import("../onesignal");
    await expect(unsubscribePush()).resolves.toBe(false);
  });
});

describe("getPushSubscriptionId", () => {
  it("returns the subscription ID from OneSignal", async () => {
    const mockOneSignal = createMockOneSignal();
    const win = globalThis as Record<string, unknown>;
    win.OneSignal = mockOneSignal;

    const { getPushSubscriptionId } = await import("../onesignal");
    const id = await getPushSubscriptionId();

    expect(id).toBe("onesignal_player_abc123");
    expect(mockOneSignal.User.PushSubscription.getIdAsync).toHaveBeenCalledOnce();
  });

  it("returns undefined when OneSignal is not initialised", async () => {
    const { getPushSubscriptionId } = await import("../onesignal");
    const id = await getPushSubscriptionId();

    expect(id).toBeUndefined();
  });

  it("returns undefined when getIdAsync throws", async () => {
    const mockOneSignal = createMockOneSignal();
    mockOneSignal.User.PushSubscription.getIdAsync.mockRejectedValue(
      new Error("SDK error"),
    );
    const win = globalThis as Record<string, unknown>;
    win.OneSignal = mockOneSignal;

    const { getPushSubscriptionId } = await import("../onesignal");
    const id = await getPushSubscriptionId();

    expect(id).toBeUndefined();
  });
});
