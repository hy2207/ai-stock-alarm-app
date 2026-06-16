import { describe, it, expect } from "vitest";
import {
  accountCreateSchema,
  accountSchema,
  sessionCreateSchema,
  sessionSchema,
  verificationTokenSchema,
} from "../auth";

// ── Account ─────────────────────────────────────────────────────────

describe("accountCreateSchema", () => {
  it("parses a minimal valid payload", () => {
    const result = accountCreateSchema.parse({
      userId: "clx123abc",
      type: "oauth",
      provider: "google",
      providerAccountId: "12345",
    });
    expect(result.provider).toBe("google");
  });

  it("parses a full payload with all optional fields", () => {
    const result = accountCreateSchema.parse({
      userId: "clx123abc",
      type: "oauth",
      provider: "kakao",
      providerAccountId: "67890",
      refresh_token: "rt1",
      access_token: "at1",
      expires_at: 1717000000,
      token_type: "Bearer",
      scope: "openid profile",
      id_token: "eyJ...",
      session_state: "ss1",
    });
    expect(result.expires_at).toBe(1717000000);
    expect(result.token_type).toBe("Bearer");
  });

  it("accepts null tokens", () => {
    const result = accountCreateSchema.parse({
      userId: "clx123abc",
      type: "oauth",
      provider: "google",
      providerAccountId: "12345",
      refresh_token: null,
      access_token: null,
    });
    expect(result.refresh_token).toBeNull();
  });

  it("rejects invalid userId", () => {
    const { success } = accountCreateSchema.safeParse({
      userId: "",
      type: "oauth",
      provider: "google",
      providerAccountId: "12345",
    });
    expect(success).toBe(false);
  });

  it("rejects missing providerAccountId", () => {
    const { success } = accountCreateSchema.safeParse({
      userId: "clx123abc",
      type: "oauth",
      provider: "google",
    });
    expect(success).toBe(false);
  });
});

describe("accountSchema (full output)", () => {
  it("parses a full Prisma Account row", () => {
    const result = accountSchema.parse({
      id: "clx333ccc",
      userId: "clx123abc",
      type: "oauth",
      provider: "google",
      providerAccountId: "12345",
      refresh_token: null,
      access_token: null,
      expires_at: null,
      token_type: null,
      scope: null,
      id_token: null,
      session_state: null,
    });
    expect(result.id).toBe("clx333ccc");
    expect(result.expires_at).toBeNull();
  });
});

// ── Session ─────────────────────────────────────────────────────────

describe("sessionCreateSchema", () => {
  it("parses a valid session payload", () => {
    const result = sessionCreateSchema.parse({
      sessionToken: "tok_abc123",
      userId: "clx123abc",
      expires: new Date("2026-06-28"),
    });
    expect(result.sessionToken).toBe("tok_abc123");
    expect(result.expires).toBeInstanceOf(Date);
  });

  it("rejects missing sessionToken", () => {
    const { success } = sessionCreateSchema.safeParse({
      userId: "clx123abc",
      expires: new Date(),
    });
    expect(success).toBe(false);
  });

  it("rejects invalid userId", () => {
    const { success } = sessionCreateSchema.safeParse({
      sessionToken: "tok_abc",
      userId: "",
      expires: new Date(),
    });
    expect(success).toBe(false);
  });
});

describe("sessionSchema (full output)", () => {
  it("parses a full Prisma Session row", () => {
    const result = sessionSchema.parse({
      id: "clx444ddd",
      sessionToken: "tok_abc123",
      userId: "clx123abc",
      expires: new Date("2026-06-28"),
    });
    expect(result.id).toBe("clx444ddd");
  });
});

// ── VerificationToken ───────────────────────────────────────────────

describe("verificationTokenSchema", () => {
  it("parses a valid verification token", () => {
    const result = verificationTokenSchema.parse({
      identifier: "user@example.com",
      token: "vt_abc123",
      expires: new Date("2026-06-01"),
    });
    expect(result.identifier).toBe("user@example.com");
    expect(result.token).toBe("vt_abc123");
  });

  it("rejects empty identifier", () => {
    const { success } = verificationTokenSchema.safeParse({
      identifier: "",
      token: "vt_abc",
      expires: new Date(),
    });
    expect(success).toBe(false);
  });

  it("rejects empty token", () => {
    const { success } = verificationTokenSchema.safeParse({
      identifier: "user@example.com",
      token: "",
      expires: new Date(),
    });
    expect(success).toBe(false);
  });
});
