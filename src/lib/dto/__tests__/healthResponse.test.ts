import { describe, it, expect } from "vitest";
import { healthResponseSchema } from "../healthResponse";

const validPayload = {
  freshness: {
    yahooFinance: 2,
    finnhub: 5,
  },
  nullRate: 1.2,
  db: { connected: true, latencyMs: 12 },
};

describe("healthResponseSchema", () => {
  it("parses a valid payload with all fields present", () => {
    const result = healthResponseSchema.parse(validPayload);
    expect(result.freshness.yahooFinance).toBe(2);
    expect(result.freshness.finnhub).toBe(5);
    expect(result.nullRate).toBe(1.2);
  });

  it("accepts null freshness when data has never been collected", () => {
    const payload = {
      freshness: { yahooFinance: null, finnhub: null },
      nullRate: 100,
      db: { connected: false, latencyMs: null },
    };
    const result = healthResponseSchema.parse(payload);
    expect(result.freshness.yahooFinance).toBeNull();
    expect(result.nullRate).toBe(100);
  });

  it("rejects a nullRate below 0", () => {
    const { success } = healthResponseSchema.safeParse({
      ...validPayload,
      nullRate: -0.1,
    });
    expect(success).toBe(false);
  });

  it("rejects a nullRate above 100", () => {
    const { success } = healthResponseSchema.safeParse({
      ...validPayload,
      nullRate: 100.1,
    });
    expect(success).toBe(false);
  });

  it("rejects negative freshness values", () => {
    const { success } = healthResponseSchema.safeParse({
      ...validPayload,
      freshness: { yahooFinance: -1, finnhub: 0 },
    });
    expect(success).toBe(false);
  });

  it("rejects missing freshness field", () => {
    const { success } = healthResponseSchema.safeParse({
      nullRate: 0,
    });
    expect(success).toBe(false);
  });

  it("rejects missing nullRate field", () => {
    const { success } = healthResponseSchema.safeParse({
      freshness: { yahooFinance: 0, finnhub: 0 },
      db: { connected: true, latencyMs: 1 },
    });
    expect(success).toBe(false);
  });

  it("rejects missing db field", () => {
    const { success } = healthResponseSchema.safeParse({
      freshness: { yahooFinance: 0, finnhub: 0 },
      nullRate: 0,
    });
    expect(success).toBe(false);
  });

  it("infers correct TypeScript type", () => {
    type Inferred = import("zod").infer<typeof healthResponseSchema>;
    const payload: Inferred = {
      freshness: { yahooFinance: 1, finnhub: null },
      nullRate: 0,
      db: { connected: true, latencyMs: null },
    };
    expect(payload).toBeDefined();
  });
});
