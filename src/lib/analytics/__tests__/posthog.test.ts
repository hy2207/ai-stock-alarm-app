import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockInit = vi.fn();
const mockIdentify = vi.fn();
const mockCapture = vi.fn();
const mockReset = vi.fn();

vi.mock("posthog-js", () => ({
  default: {
    init: mockInit,
    identify: mockIdentify,
    capture: mockCapture,
    reset: mockReset,
  },
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("initPostHog", () => {
  it("initializes posthog with env config", async () => {
    vi.stubGlobal("window", {});
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_testkey123");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://eu.posthog.com");
    const { initPostHog } = await import("../posthog");
    await initPostHog();
    expect(mockInit).toHaveBeenCalledWith("phc_testkey123", {
      api_host: "https://eu.posthog.com",
      capture_pageview: false,
      capture_pageleave: false,
    });
  });

  it("does not initialize twice", async () => {
    vi.stubGlobal("window", {});
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_testkey123");
    const { initPostHog } = await import("../posthog");
    await Promise.all([initPostHog(), initPostHog()]);
    expect(mockInit).toHaveBeenCalledTimes(1);
  });

  it("skips init on server side (no window)", async () => {
    vi.stubGlobal("window", undefined);
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_testkey123");
    const { initPostHog } = await import("../posthog");
    await initPostHog();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it("skips init when POSTHOG_KEY is empty", async () => {
    vi.stubGlobal("window", {});
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    const { initPostHog } = await import("../posthog");
    await initPostHog();
    expect(mockInit).not.toHaveBeenCalled();
  });
});

describe("captureClientEvent", () => {
  it("captures event with properties", async () => {
    vi.stubGlobal("window", {});
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_testkey123");
    const { captureClientEvent, initPostHog } = await import("../posthog");
    await initPostHog();
    await captureClientEvent("rec_card_view", { recId: "clx123" });
    expect(mockCapture).toHaveBeenCalledWith("rec_card_view", {
      recId: "clx123",
    });
  });
});

describe("identifyUser", () => {
  it("identifies user with properties", async () => {
    vi.stubGlobal("window", {});
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_testkey123");
    const { identifyUser, initPostHog } = await import("../posthog");
    await initPostHog();
    await identifyUser("clxuser123", { email: "test@example.com" });
    expect(mockIdentify).toHaveBeenCalledWith("clxuser123", {
      email: "test@example.com",
    });
  });
});

describe("resetUser", () => {
  it("resets posthog user", async () => {
    vi.stubGlobal("window", {});
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_testkey123");
    const { resetUser, initPostHog } = await import("../posthog");
    await initPostHog();
    await resetUser();
    expect(mockReset).toHaveBeenCalled();
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
