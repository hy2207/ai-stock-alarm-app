import { describe, it, expect, vi } from "vitest";

const mockMiddleware = vi.fn();

vi.mock("next-auth/middleware", () => ({
  default: mockMiddleware,
}));

describe("middleware (AUTH-C02)", () => {
  it("exports a default middleware function from next-auth", async () => {
    const { default: middleware } = await import("../middleware");
    expect(middleware).toBe(mockMiddleware);
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
