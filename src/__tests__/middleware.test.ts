import { describe, it, expect, vi } from "vitest";

const mockNextAuthMiddleware = vi.fn();

vi.mock("next-auth/middleware", () => ({
  default: mockNextAuthMiddleware,
}));

describe("middleware (AUTH-C02)", () => {
  describe("re-export and matcher config", () => {
    it("exports a default middleware function from next-auth", async () => {
      const { default: middleware } = await import("../middleware");
      expect(middleware).toBe(mockNextAuthMiddleware);
      expect(typeof middleware).toBe("function");
    });

    it("defines a matcher config that protects the home route", async () => {
      const { config } = await import("../middleware");
      expect(config).toBeDefined();
      expect(config.matcher).toBeDefined();
      expect(Array.isArray(config.matcher)).toBe(true);
      expect(config.matcher).toContain("/");
    });

    it("excludes NextAuth API routes from the matcher", async () => {
      const { config } = await import("../middleware");
      const hasAuthExclusion = config.matcher.some(
        (p: string) => p.includes("/api/auth") === false,
      );
      expect(hasAuthExclusion).toBe(true);
    });
  });

  describe("GWT: 미인증 접근 → /login 리다이렉트 (REQ-FUNC-091)", () => {
    it("Given 미인증 사용자가 홈(/)에 접근했고 When Middleware에서 세션 토큰이 없음을 확인하면 Then /login으로 리다이렉트된다", async () => {
      mockNextAuthMiddleware.mockResolvedValueOnce(
        Response.redirect("http://localhost:3000/login"),
      );

      const { default: middleware } = await import("../middleware");
      const request = new Request("http://localhost:3000/");
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
    });
  });

  describe("GWT: 유효 세션 → 통과 (REQ-FUNC-091)", () => {
    it("Given 유효한 세션을 가진 사용자가 보호 경로에 접근했고 When 세션이 유효하면 Then 요청이 통과된다", async () => {
      mockNextAuthMiddleware.mockResolvedValueOnce(new Response(null, { status: 200 }));

      const { default: middleware } = await import("../middleware");
      const request = new Request("http://localhost:3000/");
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe("GWT: 만료 세션 → 재로그인 유도 (REQ-FUNC-092)", () => {
    it("Given 만료된 세션을 가진 사용자가 재로그인 화면이 필요하고 When API 요청이 발생하면 Then /login으로 리다이렉트된다", async () => {
      mockNextAuthMiddleware.mockResolvedValueOnce(
        Response.redirect("http://localhost:3000/login"),
      );

      const { default: middleware } = await import("../middleware");
      const request = new Request("http://localhost:3000/api/recommendations/today");
      const response = await middleware(request);

      expect(response.status).toBe(302);
      expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
    });

    it("Given 만료 세션이고 토큰 자동 갱신으로 복구된 경우 When 요청이 발생하면 Then 요청이 통과된다", async () => {
      mockNextAuthMiddleware.mockResolvedValueOnce(new Response(null, { status: 200 }));

      const { default: middleware } = await import("../middleware");
      const request = new Request("http://localhost:3000/api/recommendations/today");
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe("GWT: 요청 포워딩 검증 (REQ-FUNC-091/092)", () => {
    it("Given 모든 요청과 응답이 When 미들웨어 함수를 통과하면 Then next-auth/middleware로 정확히 위임된다", async () => {
      vi.clearAllMocks();

      const req1 = new Request("http://localhost:3000/");
      const req2 = new Request("http://localhost:3000/settings");
      const res1 = new Response("redirected", { status: 302 });
      const res2 = new Response("ok", { status: 200 });

      mockNextAuthMiddleware
        .mockResolvedValueOnce(res1)
        .mockResolvedValueOnce(res2);

      const { default: middleware } = await import("../middleware");

      const [actualRes1, actualRes2] = await Promise.all([
        middleware(req1),
        middleware(req2),
      ]);

      expect(mockNextAuthMiddleware).toHaveBeenCalledTimes(2);
      expect(mockNextAuthMiddleware).toHaveBeenNthCalledWith(1, req1);
      expect(mockNextAuthMiddleware).toHaveBeenNthCalledWith(2, req2);
      expect(actualRes1).toBe(res1);
      expect(actualRes2).toBe(res2);
    });
  });
});
