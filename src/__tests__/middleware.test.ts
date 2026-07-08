import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import middleware, { isProtectedPath } from "../middleware";

const getTokenMock = vi.hoisted(() => vi.fn());

vi.mock("next-auth/jwt", () => ({
  getToken: getTokenMock,
}));

function makeRequest(path: string) {
  return new NextRequest(new URL(path, "https://stockalarm.test"));
}

describe("auth middleware path policy", () => {
  it.each([
    "/",
    "/login",
    "/api/auth/signin",
    "/api/cron/morning-briefing",
    "/api/admin/health",
    "/_next/static/chunk.js",
    "/favicon.ico",
  ])(
    "treats %s as public",
    (path) => {
      expect(isProtectedPath(path)).toBe(false);
    },
  );

  it.each(["/today", "/app", "/onboarding", "/archive", "/settings", "/recommendations/rec-1", "/state/error"])(
    "treats %s as protected",
    (path) => {
      expect(isProtectedPath(path)).toBe(true);
    },
  );
});

describe("auth middleware", () => {
  beforeEach(() => {
    getTokenMock.mockReset();
    vi.stubEnv("NEXTAUTH_SECRET", "test-nextauth-secret");
  });

  it("GWT: Given unauthenticated protected access When middleware runs Then redirects to login with callbackUrl", async () => {
    getTokenMock.mockResolvedValue(null);

    const response = await middleware(makeRequest("/app?from=push"));

    expect(response?.status).toBe(307);
    expect(response?.headers.get("location")).toBe(
      "https://stockalarm.test/login?callbackUrl=%2Fapp%3Ffrom%3Dpush",
    );
    expect(getTokenMock).toHaveBeenCalledWith({
      req: expect.any(NextRequest),
      secret: "test-nextauth-secret",
    });
  });

  it("GWT: Given unauthenticated /today access When middleware runs Then redirects to login with callbackUrl", async () => {
    getTokenMock.mockResolvedValue(null);

    const response = await middleware(makeRequest("/today?from=push"));

    expect(response?.status).toBe(307);
    expect(response?.headers.get("location")).toBe(
      "https://stockalarm.test/login?callbackUrl=%2Ftoday%3Ffrom%3Dpush",
    );
  });

  it("GWT: Given valid session token When accessing protected page Then passes through", async () => {
    getTokenMock.mockResolvedValue({ sub: "user-1" });

    const response = await middleware(makeRequest("/settings"));

    expect(response?.status).toBe(200);
    expect(response?.headers.get("location")).toBeNull();
  });

  it("GWT: Given refresh error token When accessing protected page Then redirects away from protected content", async () => {
    getTokenMock.mockResolvedValue({
      sub: "user-1",
      error: "RefreshAccessTokenError",
    });

    const response = await middleware(makeRequest("/archive"));

    expect(response?.status).toBe(307);
    expect(response?.headers.get("location")).toBe(
      "https://stockalarm.test/login?callbackUrl=%2Farchive",
    );
  });

  it("GWT: Given expired token without refresh path When accessing protected page Then redirects to login", async () => {
    getTokenMock.mockResolvedValue({
      sub: "user-1",
      error: "NoRefreshToken",
    });

    const response = await middleware(makeRequest("/recommendations/rec-1"));

    expect(response?.status).toBe(307);
    expect(response?.headers.get("location")).toBe(
      "https://stockalarm.test/login?callbackUrl=%2Frecommendations%2Frec-1",
    );
  });

  it("GWT: Given public route When middleware runs Then skips token lookup", async () => {
    const response = await middleware(makeRequest("/login"));

    expect(response?.status).toBe(200);
    expect(getTokenMock).not.toHaveBeenCalled();
  });

  it("GWT: Given cron or health route When middleware runs Then skips NextAuth token lookup", async () => {
    const cronResponse = await middleware(makeRequest("/api/cron/morning-briefing"));
    const healthResponse = await middleware(makeRequest("/api/admin/health"));

    expect(cronResponse?.status).toBe(200);
    expect(healthResponse?.status).toBe(200);
    expect(getTokenMock).not.toHaveBeenCalled();
  });
});
