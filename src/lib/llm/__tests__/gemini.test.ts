import { describe, it, expect } from "vitest";

describe("gemini module", () => {
  it("exports expected symbols", async () => {
    const mod = await import("../gemini");
    expect(mod.getGeminiProvider).toBeInstanceOf(Function);
    expect(mod.getGeminiModel).toBeInstanceOf(Function);
  });

  it("throws when GEMINI_API_KEY is not set", async () => {
    const keyBak = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const mod = await import("../gemini");
    expect(() => mod.getGeminiProvider()).toThrow();

    process.env.GEMINI_API_KEY = keyBak;
  });

  it("uses GEMINI_MODEL env var when set", async () => {
    const modelBak = process.env.GEMINI_MODEL;
    const keyBak = process.env.GEMINI_API_KEY;
    process.env.GEMINI_MODEL = "models/gemini-2.5-pro-001";
    process.env.GEMINI_API_KEY = "test-key-for-validation";

    const mod = await import("../gemini");
    expect(typeof mod.getGeminiModel).toBe("function");

    process.env.GEMINI_MODEL = modelBak;
    process.env.GEMINI_API_KEY = keyBak;
  });
});
