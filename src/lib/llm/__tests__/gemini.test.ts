import { describe, expect, it, vi } from "vitest";

const mockModel = vi.hoisted(() => ({ provider: "google", modelId: "mock" }));
const mockProvider = vi.hoisted(() => vi.fn(() => mockModel));
const mockCreateGoogleGenerativeAI = vi.hoisted(() => vi.fn(() => mockProvider));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: mockCreateGoogleGenerativeAI,
}));

async function withEnv<T>(
  env: Record<string, string | undefined>,
  fn: () => T | Promise<T>,
): Promise<T> {
  const previous: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(env)) {
    previous[key] = process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return await fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

async function importFreshGemini() {
  vi.resetModules();
  vi.clearAllMocks();
  mockProvider.mockClear();
  return import("../gemini");
}

describe("gemini module (LLM-Q01)", () => {
  it("exports expected symbols", async () => {
    const mod = await importFreshGemini();

    expect(mod.getGeminiProvider).toBeInstanceOf(Function);
    expect(mod.getGeminiModel).toBeInstanceOf(Function);
  });

  it("throws when GEMINI_API_KEY is missing", async () => {
    await withEnv({ GEMINI_API_KEY: undefined }, async () => {
      const mod = await importFreshGemini();

      expect(() => mod.getGeminiProvider()).toThrow(
        "GEMINI_API_KEY is not set",
      );
    });
  });

  it("throws when GEMINI_API_KEY is still the example placeholder", async () => {
    await withEnv({ GEMINI_API_KEY: "your-gemini-api-key" }, async () => {
      const mod = await importFreshGemini();

      expect(() => mod.getGeminiProvider()).toThrow(
        "GEMINI_API_KEY is not set",
      );
    });
  });

  it("creates the provider with GEMINI_API_KEY when a non-placeholder key is set", async () => {
    await withEnv({ GEMINI_API_KEY: "test-gemini-key" }, async () => {
      const mod = await importFreshGemini();

      expect(mod.getGeminiProvider()).toBe(mockProvider);
      expect(mockCreateGoogleGenerativeAI).toHaveBeenCalledWith({
        apiKey: "test-gemini-key",
      });
    });
  });

  it("reuses the provider singleton across repeated calls", async () => {
    await withEnv({ GEMINI_API_KEY: "test-gemini-key" }, async () => {
      const mod = await importFreshGemini();

      expect(mod.getGeminiProvider()).toBe(mockProvider);
      expect(mod.getGeminiProvider()).toBe(mockProvider);
      expect(mockCreateGoogleGenerativeAI).toHaveBeenCalledTimes(1);
    });
  });

  it("uses GEMINI_MODEL env var when set", async () => {
    await withEnv(
      {
        GEMINI_API_KEY: "test-gemini-key",
        GEMINI_MODEL: "gemini-2.5-pro-001",
      },
      async () => {
        const mod = await importFreshGemini();

        expect(mod.getGeminiModel()).toBe(mockModel);
        expect(mockProvider).toHaveBeenCalledWith("gemini-2.5-pro-001");
      },
    );
  });

  it("accepts GEMINI_MODEL values with the Google API models/ prefix", async () => {
    await withEnv(
      {
        GEMINI_API_KEY: "test-gemini-key",
        GEMINI_MODEL: "models/gemini-2.5-pro-001",
      },
      async () => {
        const mod = await importFreshGemini();

        expect(mod.getGeminiModel()).toBe(mockModel);
        expect(mockProvider).toHaveBeenCalledWith("gemini-2.5-pro-001");
      },
    );
  });

  it("falls back to the default Gemini model when GEMINI_MODEL is unset", async () => {
    await withEnv(
      { GEMINI_API_KEY: "test-gemini-key", GEMINI_MODEL: undefined },
      async () => {
        const mod = await importFreshGemini();

        expect(mod.getGeminiModel()).toBe(mockModel);
        expect(mockProvider).toHaveBeenCalledWith("gemini-2.5-flash");
      },
    );
  });

  it("falls back to the default Gemini model when GEMINI_MODEL is empty", async () => {
    await withEnv(
      { GEMINI_API_KEY: "test-gemini-key", GEMINI_MODEL: "" },
      async () => {
        const mod = await importFreshGemini();

        expect(mod.getGeminiModel()).toBe(mockModel);
        expect(mockProvider).toHaveBeenCalledWith("gemini-2.5-flash");
      },
    );
  });
});
