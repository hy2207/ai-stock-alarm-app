import { describe, it, expect } from "vitest";
import { saveRiskProfileInputSchema, riskModeSchema } from "../saveRiskProfile";

describe("riskModeSchema", () => {
  it("accepts all three risk modes", () => {
    for (const mode of ["aggressive", "balanced", "conservative"] as const) {
      expect(riskModeSchema.parse(mode)).toBe(mode);
    }
  });

  it("rejects invalid risk mode", () => {
    const { success } = riskModeSchema.safeParse("ultra");
    expect(success).toBe(false);
  });
});

describe("saveRiskProfileInputSchema", () => {
  it("parses a valid payload", () => {
    const result = saveRiskProfileInputSchema.parse({
      riskMode: "balanced",
    });
    expect(result.riskMode).toBe("balanced");
  });

  it("rejects missing riskMode", () => {
    const { success } = saveRiskProfileInputSchema.safeParse({});
    expect(success).toBe(false);
  });

  it("rejects invalid riskMode value", () => {
    const { success } = saveRiskProfileInputSchema.safeParse({
      riskMode: "extreme",
    });
    expect(success).toBe(false);
  });

  it("rejects extra unknown fields", () => {
    const { success } = saveRiskProfileInputSchema.safeParse({
      riskMode: "aggressive",
      extraField: "should not be here",
    });
    expect(success).toBe(false);
  });

  it("infers correct TypeScript type", () => {
    type Input = import("zod").infer<typeof saveRiskProfileInputSchema>;
    const payload: Input = { riskMode: "conservative" };
    expect(payload.riskMode).toBe("conservative");
  });
});
