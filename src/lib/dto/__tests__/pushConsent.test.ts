import { describe, it, expect } from "vitest";
import { pushConsentInputSchema } from "../pushConsent";

describe("pushConsentInputSchema", () => {
  it('parses "true" as boolean true', () => {
    const result = pushConsentInputSchema.safeParse({ consent: "true" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.consent).toBe(true);
  });

  it('parses "false" as boolean false', () => {
    const result = pushConsentInputSchema.safeParse({ consent: "false" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.consent).toBe(false);
  });

  it("rejects missing consent field", () => {
    const result = pushConsentInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects arbitrary string values", () => {
    const result = pushConsentInputSchema.safeParse({ consent: "yes" });
    expect(result.success).toBe(false);
  });
});
