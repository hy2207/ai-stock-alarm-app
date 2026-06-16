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
  it.each(["/", "/login", "/api/auth/signin", "/_next/static/chunk.js", "/favicon.ico"])(
    "treats %s as public",
    (path) => {
      expect(isProtectedPath(path)).toBe(false);
    },
  );

  it.each(["/app", "/onboarding", "/archive", "/settings", "/recommendations/rec-1", "/state/error"])(
    "treats %s as protected",
    (path) => {
      expect(isProtectedPath(path)).toBe(true);
    },
  );
});

describe("auth middleware", () => {
  beforeEach(() => {
    getTokenMock.mockReset();
  });

  it("redirects unauthenticated protected page requests to login with callbackUrl", async () => {
    getTokenMock.mockResolvedValue(null);

    const response = await middleware(makeRequest("/app?from=push"));

    expect(response?.status).toBe(307);
    expect(response?.headers.get("location")).toBe(
      "https://stockalarm.test/login?callbackUrl=%2Fapp%3Ffrom%3Dpush",
    );
  });

  it("allows authenticated protected page requests", async () => {
    getTokenMock.mockResolvedValue({ sub: "user-1" });

    const response = await middleware(makeRequest("/settings"));

    expect(response?.status).toBe(200);
    expect(response?.headers.get("location")).toBeNull();
  });

  it("redirects token refresh error sessions away from protected content", async () => {
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

  it("does not ask NextAuth for tokens on public routes", async () => {
    const response = await middleware(makeRequest("/login"));

    expect(response?.status).toBe(200);
    expect(getTokenMock).not.toHaveBeenCalled();
  });
});
