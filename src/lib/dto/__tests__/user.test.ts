import { describe, it, expect } from "vitest";
import { userCreateSchema, userSchema } from "../user";

describe("userCreateSchema", () => {
  it("parses a minimal valid create payload", () => {
    const result = userCreateSchema.parse({
      signupChannel: "email",
    });
    expect(result.signupChannel).toBe("email");
    expect(result.consentPush).toBe(false);
    expect(result.timezone).toBe("Asia/Seoul");
  });

  it("parses a full create payload", () => {
    const result = userCreateSchema.parse({
      email: "user@example.com",
      name: "Test User",
      signupChannel: "google",
      timezone: "America/New_York",
      consentPush: true,
    });
    expect(result.email).toBe("user@example.com");
    expect(result.name).toBe("Test User");
    expect(result.signupChannel).toBe("google");
  });

  it("accepts nullable email and name", () => {
    const result = userCreateSchema.parse({
      email: null,
      name: null,
      signupChannel: "kakao",
    });
    expect(result.email).toBeNull();
    expect(result.name).toBeNull();
  });

  it("rejects an invalid email", () => {
    const { success } = userCreateSchema.safeParse({
      email: "not-an-email",
      signupChannel: "email",
    });
    expect(success).toBe(false);
  });

  it("rejects an invalid signupChannel", () => {
    const { success } = userCreateSchema.safeParse({
      signupChannel: "twitter",
    });
    expect(success).toBe(false);
  });

  it("rejects empty signupChannel", () => {
    const { success } = userCreateSchema.safeParse({
      signupChannel: "",
    });
    expect(success).toBe(false);
  });

  it("rejects a name that is too long", () => {
    const { success } = userCreateSchema.safeParse({
      signupChannel: "email",
      name: "A".repeat(101),
    });
    expect(success).toBe(false);
  });

  it("rejects empty timezone", () => {
    const { success } = userCreateSchema.safeParse({
      signupChannel: "email",
      timezone: "",
    });
    expect(success).toBe(false);
  });

  it("rejects a non-boolean consentPush", () => {
    const { success } = userCreateSchema.safeParse({
      signupChannel: "email",
      consentPush: "yes",
    });
    expect(success).toBe(false);
  });

  it("infers correct TypeScript types", () => {
    type Input = import("zod").infer<typeof userCreateSchema>;
    const payload: Input = { signupChannel: "email" };
    expect(payload.signupChannel).toBe("email");
  });
});

describe("userSchema (full output)", () => {
  it("parses a full Prisma User row", () => {
    const result = userSchema.parse({
      id: "clx123abc",
      email: "user@example.com",
      name: "Test User",
      signupChannel: "google",
      timezone: "Asia/Seoul",
      consentPush: true,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-05-28"),
    });
    expect(result.id).toBe("clx123abc");
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("rejects a row with an invalid cuid", () => {
    const { success } = userSchema.safeParse({
      id: "",
      email: null,
      name: null,
      signupChannel: "email",
      timezone: "Asia/Seoul",
      consentPush: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(success).toBe(false);
  });
});
