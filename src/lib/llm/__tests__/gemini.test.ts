import { describe, it, expect, vi } from "vitest";

const mockGetModel = vi.fn();
const mockCreateGoogleGenerativeAI = vi.fn(() => ({
  getModel: mockGetModel,
}));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: mockCreateGoogleGenerativeAI,
}));

/**
 * Set env vars for the scope of `fn`, restoring previous values after.
 * Works with both sync and async callbacks — awaits the result if it
 * is a thenable so the `finally` block runs after the callback completes.
 * Pass `undefined` to delete a key.
 */
async function withEnv<T>(
  env: Record<string, string | undefined>,
  fn: () => T,
): Promise<T> {
  const bak: Record<string, string | undefined> = {};
  for (const k of Object.keys(env)) {
    bak[k] = process.env[k];
    if (env[k] === undefined) delete process.env[k];
    else process.env[k] = env[k];
  }
  try {
    const result = fn();
    return result instanceof Promise ? await result : result;
  } finally {
    for (const [k, v] of Object.entries(bak)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

/** Dynamic import that resets module registry first so the singleton is fresh. */
async function importGemini() {
  vi.resetModules();
  vi.clearAllMocks();
  return import("../gemini");
}

describe("gemini module (LLM-Q01)", () => {
  describe("module interface", () => {
    it("exports getGeminiProvider and getGeminiModel functions", async () => {
      const mod = await importGemini();
      expect(mod.getGeminiProvider).toBeInstanceOf(Function);
      expect(mod.getGeminiModel).toBeInstanceOf(Function);
    });
  });

  describe("getGeminiApiKey validation", () => {
    it("throws when GEMINI_API_KEY is missing", async () => {
      await withEnv({ GEMINI_API_KEY: undefined }, async () => {
        const mod = await importGemini();
        expect(() => mod.getGeminiProvider()).toThrow(
          "GEMINI_API_KEY is not set",
        );
      });
    });

    it("throws when GEMINI_API_KEY is the placeholder value", async () => {
      await withEnv({ GEMINI_API_KEY: "your-gemini-api-key" }, async () => {
        const mod = await importGemini();
        expect(() => mod.getGeminiProvider()).toThrow(
          "GEMINI_API_KEY is not set",
        );
      });
    });

    it("creates provider when GEMINI_API_KEY is valid", async () => {
      await withEnv({ GEMINI_API_KEY: "valid-test-key-12345" }, async () => {
        const mod = await importGemini();
        const provider = mod.getGeminiProvider();

        expect(provider).toBeDefined();
        expect(mockCreateGoogleGenerativeAI).toHaveBeenCalledWith({
          apiKey: "valid-test-key-12345",
        });
      });
    });
  });

  describe("getGeminiModelName (env var fallback)", () => {
    it("uses GEMINI_MODEL env var when set", async () => {
      await withEnv(
        {
          GEMINI_API_KEY: "test-key-for-model-1",
          GEMINI_MODEL: "models/gemini-2.5-pro-001",
        },
        async () => {
          const mod = await importGemini();
          mod.getGeminiModel();

          expect(mockGetModel).toHaveBeenCalledWith(
            "models/gemini-2.5-pro-001",
          );
        },
      );
    });

    it("falls back to default model when GEMINI_MODEL is unset", async () => {
      await withEnv(
        { GEMINI_API_KEY: "test-key-for-model-2", GEMINI_MODEL: undefined },
        async () => {
          const mod = await importGemini();
          mod.getGeminiModel();

          expect(mockGetModel).toHaveBeenCalledWith(
            "models/gemini-2.0-flash-001",
          );
        },
      );
    });

    it("falls back to default model when GEMINI_MODEL is empty string", async () => {
      await withEnv(
        { GEMINI_API_KEY: "test-key-for-model-3", GEMINI_MODEL: "" },
        async () => {
          const mod = await importGemini();
          mod.getGeminiModel();

          expect(mockGetModel).toHaveBeenCalledWith(
            "models/gemini-2.0-flash-001",
          );
        },
      );
    });

    it("accepts any non-empty model string without validation", async () => {
      await withEnv(
        {
          GEMINI_API_KEY: "test-key-for-model-4",
          GEMINI_MODEL: "models/custom-experimental-model-v99",
        },
        async () => {
          const mod = await importGemini();
          mod.getGeminiModel();

          expect(mockGetModel).toHaveBeenCalledWith(
            "models/custom-experimental-model-v99",
          );
        },
      );
    });
  });

  describe("getGeminiProvider singleton", () => {
    it("returns the same provider instance on repeated calls", async () => {
      await withEnv(
        { GEMINI_API_KEY: "test-key-for-singleton" },
        async () => {
          const mod = await importGemini();
          const provider1 = mod.getGeminiProvider();
          const provider2 = mod.getGeminiProvider();

          expect(provider1).toBe(provider2);
          expect(mockCreateGoogleGenerativeAI).toHaveBeenCalledTimes(1);
        },
      );
    });
  });

  describe("getGeminiModel delegation", () => {
    it("calls getModel with the correct model name", async () => {
      await withEnv(
        {
          GEMINI_API_KEY: "test-key-for-delegation",
          GEMINI_MODEL: "models/gemini-2.0-flash-001",
        },
        async () => {
          const mod = await importGemini();
          mod.getGeminiModel();

          expect(mockGetModel).toHaveBeenCalledTimes(1);
          expect(mockGetModel).toHaveBeenCalledWith(
            "models/gemini-2.0-flash-001",
          );
        },
      );
    });
  });
});
