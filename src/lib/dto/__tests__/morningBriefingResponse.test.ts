import { describe, it, expect } from "vitest";
import { morningBriefingResponseSchema } from "../morningBriefingResponse";

const validPayload = {
  scheduled: 10,
  sent: 10,
  failed: 0,
};

describe("morningBriefingResponseSchema", () => {
  it("parses a valid payload with all fields present", () => {
    const result = morningBriefingResponseSchema.parse(validPayload);
    expect(result.scheduled).toBe(10);
    expect(result.sent).toBe(10);
    expect(result.failed).toBe(0);
  });

  it("parses a zero-entries response", () => {
    const result = morningBriefingResponseSchema.parse({
      scheduled: 0,
      sent: 0,
      failed: 0,
    });
    expect(result).toEqual({ scheduled: 0, sent: 0, failed: 0 });
  });

  it("rejects missing scheduled field", () => {
    const { success } = morningBriefingResponseSchema.safeParse({
      sent: 10,
      failed: 0,
    });
    expect(success).toBe(false);
  });

  it("rejects missing sent field", () => {
    const { success } = morningBriefingResponseSchema.safeParse({
      scheduled: 10,
      failed: 0,
    });
    expect(success).toBe(false);
  });

  it("rejects negative values", () => {
    const { success, error } = morningBriefingResponseSchema.safeParse({
      scheduled: -1,
      sent: 10,
      failed: 0,
    });
    expect(success).toBe(false);
    expect(error?.issues[0].code).toBe("too_small");
  });

  it("rejects non-integer values", () => {
    const { success } = morningBriefingResponseSchema.safeParse({
      scheduled: 10.5,
      sent: 10,
      failed: 0,
    });
    expect(success).toBe(false);
  });

  it("infers correct TypeScript type", () => {
    type Inferred = import("zod").infer<typeof morningBriefingResponseSchema>;
    const _typeCheck: Inferred = { scheduled: 5, sent: 3, failed: 1 };
    expect(_typeCheck).toBeDefined();
  });
});
