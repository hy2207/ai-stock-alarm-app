import { describe, it, expect } from "vitest";
import {
  llmResponseSchema,
  llmOkResponseSchema,
  llmNoCallResponseSchema,
} from "../llmOutput";

const validVariant = {
  confidenceMode: "balanced" as const,
  ticker: "AAPL",
  direction: "BUY" as const,
  entryPrice: 185.5,
  targetPrice: 210.0,
  stopPrice: 170.0,
  holdDays: 5,
  reasonLine: "Strong earnings and buyback program",
};

const validRangeVariant = {
  confidenceMode: "aggressive" as const,
  ticker: "AAPL",
  direction: "BUY" as const,
  entryRangeLow: 180.0,
  entryRangeHigh: 190.0,
  targetRangeLow: 200.0,
  targetRangeHigh: 220.0,
  holdDays: 7,
  reasonLine: "Aggressive entry on momentum",
};

describe("llmResponseSchema", () => {
  it("parses ok response with 3 variants", () => {
    const result = llmResponseSchema.parse({
      status: "ok",
      variants: [
        { ...validVariant, confidenceMode: "aggressive" },
        { ...validVariant, confidenceMode: "balanced" },
        { ...validVariant, confidenceMode: "conservative" },
      ],
    });
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.variants).toHaveLength(3);
      expect(result.variants[0].confidenceMode).toBe("aggressive");
      expect(result.variants[1].confidenceMode).toBe("balanced");
      expect(result.variants[2].confidenceMode).toBe("conservative");
    }
  });

  it("parses ok response with range prices", () => {
    const result = llmOkResponseSchema.parse({
      status: "ok",
      variants: [
        { ...validRangeVariant, confidenceMode: "aggressive" },
        { ...validRangeVariant, confidenceMode: "balanced" },
        { ...validRangeVariant, confidenceMode: "conservative" },
      ],
    });
    expect(result.variants).toHaveLength(3);
  });

  it("parses no_call response", () => {
    const result = llmResponseSchema.parse({
      status: "no_call",
      reason: "Insufficient data for AAPL today",
    });
    expect(result.status).toBe("no_call");
  });

  it("rejects ok response with fewer than 3 variants", () => {
    const { success } = llmOkResponseSchema.safeParse({
      status: "ok",
      variants: [{ ...validVariant, confidenceMode: "aggressive" }],
    });
    expect(success).toBe(false);
  });

  it("rejects ok response with more than 3 variants", () => {
    const { success } = llmOkResponseSchema.safeParse({
      status: "ok",
      variants: [
        { ...validVariant, confidenceMode: "aggressive" },
        { ...validVariant, confidenceMode: "balanced" },
        { ...validVariant, confidenceMode: "conservative" },
        { ...validVariant, confidenceMode: "aggressive" },
      ],
    });
    expect(success).toBe(false);
  });

  it("rejects missing ticker in variant", () => {
    const { success } = llmOkResponseSchema.safeParse({
      status: "ok",
      variants: [
        { ...validVariant, confidenceMode: "aggressive", ticker: undefined },
        { ...validVariant, confidenceMode: "balanced" },
        { ...validVariant, confidenceMode: "conservative" },
      ],
    });
    expect(success).toBe(false);
  });

  it("rejects empty reasonLine", () => {
    const { success } = llmOkResponseSchema.safeParse({
      status: "ok",
      variants: [
        { ...validVariant, confidenceMode: "aggressive", reasonLine: "" },
        { ...validVariant, confidenceMode: "balanced", reasonLine: "" },
        { ...validVariant, confidenceMode: "conservative", reasonLine: "" },
      ],
    });
    expect(success).toBe(false);
  });

  it("rejects whitespace reasonLine", () => {
    const { success } = llmOkResponseSchema.safeParse({
      status: "ok",
      variants: [
        { ...validVariant, confidenceMode: "aggressive", reasonLine: "   " },
        { ...validVariant, confidenceMode: "balanced" },
        { ...validVariant, confidenceMode: "conservative" },
      ],
    });
    expect(success).toBe(false);
  });

  it("rejects invalid direction", () => {
    const { success } = llmOkResponseSchema.safeParse({
      status: "ok",
      variants: [
        { ...validVariant, confidenceMode: "aggressive", direction: "HOLD" },
        { ...validVariant, confidenceMode: "balanced" },
        { ...validVariant, confidenceMode: "conservative" },
      ],
    });
    expect(success).toBe(false);
  });

  it("rejects holdDays outside 1-10", () => {
    const { success } = llmOkResponseSchema.safeParse({
      status: "ok",
      variants: [
        { ...validVariant, confidenceMode: "aggressive", holdDays: 0 },
        { ...validVariant, confidenceMode: "balanced" },
        { ...validVariant, confidenceMode: "conservative" },
      ],
    });
    expect(success).toBe(false);
  });

  it("rejects no_call with empty reason", () => {
    const { success } = llmNoCallResponseSchema.safeParse({
      status: "no_call",
      reason: "",
    });
    expect(success).toBe(false);
  });

  it("rejects variant with entryRangeLow but missing entryRangeHigh", () => {
    const { success } = llmOkResponseSchema.safeParse({
      status: "ok",
      variants: [
        { ...validVariant, confidenceMode: "aggressive", entryPrice: undefined, entryRangeLow: 180.0 },
        { ...validVariant, confidenceMode: "balanced" },
        { ...validVariant, confidenceMode: "conservative" },
      ],
    });
    expect(success).toBe(true);
  });

  it("rejects ticker exceeding 10 characters", () => {
    const { success } = llmOkResponseSchema.safeParse({
      status: "ok",
      variants: [
        { ...validVariant, confidenceMode: "aggressive", ticker: "VERYLONGTKR" },
        { ...validVariant, confidenceMode: "balanced" },
        { ...validVariant, confidenceMode: "conservative" },
      ],
    });
    expect(success).toBe(false);
  });

  it("rejects invalid confidenceMode", () => {
    const { success } = llmOkResponseSchema.safeParse({
      status: "ok",
      variants: [
        { ...validVariant, confidenceMode: "extreme" },
        { ...validVariant, confidenceMode: "balanced" },
        { ...validVariant, confidenceMode: "conservative" },
      ],
    });
    expect(success).toBe(false);
  });

  it("rejects negative price in LLM variant", () => {
    const { success } = llmOkResponseSchema.safeParse({
      status: "ok",
      variants: [
        { ...validVariant, confidenceMode: "aggressive", entryPrice: -10 },
        { ...validVariant, confidenceMode: "balanced" },
        { ...validVariant, confidenceMode: "conservative" },
      ],
    });
    expect(success).toBe(false);
  });

  it("accepts all-null optional price fields in LLM variant", () => {
    const { success } = llmOkResponseSchema.safeParse({
      status: "ok",
      variants: [
        { ...validVariant, confidenceMode: "aggressive", entryPrice: null, entryRangeLow: null, entryRangeHigh: null },
        { ...validVariant, confidenceMode: "balanced" },
        { ...validVariant, confidenceMode: "conservative" },
      ],
    });
    expect(success).toBe(true);
  });
});
