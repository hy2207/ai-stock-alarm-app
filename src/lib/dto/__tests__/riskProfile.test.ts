import { describe, it, expect } from "vitest";
import { riskProfileCreateSchema, riskProfileSchema } from "../riskProfile";

describe("riskProfileCreateSchema", () => {
  it("parses a valid create payload", () => {
    const result = riskProfileCreateSchema.parse({
      userId: "clx123abc",
      riskMode: "aggressive",
    });
    expect(result.userId).toBe("clx123abc");
    expect(result.riskMode).toBe("aggressive");
  });

  it("accepts all three risk modes", () => {
    for (const mode of ["aggressive", "balanced", "conservative"] as const) {
      const result = riskProfileCreateSchema.parse({
        userId: "clx123abc",
        riskMode: mode,
      });
      expect(result.riskMode).toBe(mode);
    }
  });

  it("rejects an invalid risk mode", () => {
    const { success } = riskProfileCreateSchema.safeParse({
      userId: "clx123abc",
      riskMode: "ultra",
    });
    expect(success).toBe(false);
  });

  it("rejects empty risk mode", () => {
    const { success } = riskProfileCreateSchema.safeParse({
      userId: "clx123abc",
      riskMode: "",
    });
    expect(success).toBe(false);
  });

  it("rejects missing userId", () => {
    const { success } = riskProfileCreateSchema.safeParse({
      riskMode: "balanced",
    });
    expect(success).toBe(false);
  });

  it("rejects invalid userId", () => {
    const { success } = riskProfileCreateSchema.safeParse({
      userId: "",
      riskMode: "balanced",
    });
    expect(success).toBe(false);
  });

  it("rejects extra unknown fields", () => {
    const { success } = riskProfileCreateSchema.safeParse({
      userId: "clx123abc",
      riskMode: "conservative",
      extraField: "should not be here",
    });
    expect(success).toBe(false);
  });
});

describe("riskProfileSchema (full output)", () => {
  it("parses a full Prisma row", () => {
    const result = riskProfileSchema.parse({
      id: "clx999def",
      userId: "clx123abc",
      riskMode: "aggressive",
      updatedAt: new Date("2026-05-28"),
    });
    expect(result.id).toBe("clx999def");
    expect(result.userId).toBe("clx123abc");
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it("rejects a row with an invalid risk mode", () => {
    const { success } = riskProfileSchema.safeParse({
      id: "clx999def",
      userId: "clx123abc",
      riskMode: "unknown",
      updatedAt: new Date(),
    });
    expect(success).toBe(false);
  });
});
