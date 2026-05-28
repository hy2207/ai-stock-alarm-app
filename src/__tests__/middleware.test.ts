import { describe, it, expect, vi, beforeEach } from "vitest";
import { isPublicPath } from "../middleware";

const mockGetToken = vi.hoisted(() => vi.fn());
vi.mock("next-auth/jwt", () => ({ getToken: mockGetToken }));

const mockNextResponse = vi.hoisted(() => ({
  next: vi.fn(() => ({ kind: "next" })),
  redirect: vi.fn((url: URL) => ({ kind: "redirect", url })),
}));
vi.mock("next/server", () => ({ NextResponse: mockNextResponse }));

// Dynamic import after hoisted mocks are set up
const { middleware } = await import("../middleware");

function createMockRequest(pathname: string) {
  return {
    nextUrl: { pathname, searchParams: new URLSearchParams() },
    url: `https://example.com${pathname}`,
  } as unknown as Request;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("isPublicPath", () => {
  it("returns true for /login", () => {
    expect(isPublicPath("/login")).toBe(true);
  });

  it("returns true for /api/auth/signin", () => {
    expect(isPublicPath("/api/auth/signin")).toBe(true);
  });

  it("returns true for /api/cron/morning-briefing", () => {
    expect(isPublicPath("/api/cron/morning-briefing")).toBe(true);
  });

  it("returns true for /api/admin/health", () => {
    expect(isPublicPath("/api/admin/health")).toBe(true);
  });

  it("returns false for / (home)", () => {
    expect(isPublicPath("/")).toBe(false);
  });

  it("returns false for /recommendations/clx123", () => {
    expect(isPublicPath("/recommendations/clx123")).toBe(false);
  });

  it("returns false for /settings", () => {
    expect(isPublicPath("/settings")).toBe(false);
  });

  it("returns false for /app", () => {
    expect(isPublicPath("/app")).toBe(false);
  });
});

describe("middleware", () => {
  it("allows public paths without token check", async () => {
    mockGetToken.mockResolvedValue(null);
    const req = createMockRequest("/login");
    await middleware(req);
    expect(mockGetToken).not.toHaveBeenCalled();
  });

  it("redirects to login for protected route when not authenticated", async () => {
    mockGetToken.mockResolvedValue(null);
    const req = createMockRequest("/settings");
    await middleware(req);
    expect(mockGetToken).toHaveBeenCalled();
    expect(mockNextResponse.redirect).toHaveBeenCalled();
    const redirectCall = mockNextResponse.redirect.mock.calls[0][0];
    expect(redirectCall.pathname).toBe("/login");
  });

  it("allows protected route when authenticated", async () => {
    mockGetToken.mockResolvedValue({ sub: "clxuser123", name: "Test" });
    const req = createMockRequest("/settings");
    await middleware(req);
    expect(mockNextResponse.next).toHaveBeenCalled();
  });

  it("passes callbackUrl to login redirect", async () => {
    mockGetToken.mockResolvedValue(null);
    const req = createMockRequest("/recommendations/clx123");
    await middleware(req);
    const redirectCall = mockNextResponse.redirect.mock.calls[0][0];
    expect(redirectCall.searchParams.get("callbackUrl")).toBe(
      "/recommendations/clx123",
    );
  });
});
