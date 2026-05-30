import { describe, it, expect } from "vitest";
import { deleteAccountOutputSchema } from "../deleteAccount";

describe("deleteAccountOutputSchema", () => {
  it("accepts success: true", () => {
    const result = deleteAccountOutputSchema.parse({ success: true });
    expect(result.success).toBe(true);
  });

  it("rejects missing success", () => {
    const { success } = deleteAccountOutputSchema.safeParse({});
    expect(success).toBe(false);
  });

  it("rejects non-boolean success", () => {
    const { success } = deleteAccountOutputSchema.safeParse({ success: "yes" });
    expect(success).toBe(false);
  });

  it("infers correct TypeScript type", () => {
    const output: { success: boolean } = { success: true };
    expect(deleteAccountOutputSchema.parse(output)).toEqual(output);
  });
});
