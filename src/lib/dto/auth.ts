import { z } from "zod";

// ── Account ─────────────────────────────────────────────────────────

/** Zod schema for validating Account create payloads. */
export const accountCreateSchema = z.object({
  userId: z.string().cuid(),
  type: z.string().min(1).max(50),
  provider: z.string().min(1).max(50),
  providerAccountId: z.string().min(1),
  refresh_token: z.string().nullable().optional(),
  access_token: z.string().nullable().optional(),
  expires_at: z.number().int().positive().nullable().optional(),
  token_type: z.string().min(1).max(50).nullable().optional(),
  scope: z.string().nullable().optional(),
  id_token: z.string().nullable().optional(),
  session_state: z.string().nullable().optional(),
});

export type AccountCreateInput = z.infer<typeof accountCreateSchema>;

/** Zod schema matching the full Prisma Account model. */
export const accountSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().nullable(),
  access_token: z.string().nullable(),
  expires_at: z.number().int().positive().nullable(),
  token_type: z.string().nullable(),
  scope: z.string().nullable(),
  id_token: z.string().nullable(),
  session_state: z.string().nullable(),
});

export type Account = z.infer<typeof accountSchema>;

// ── Session ─────────────────────────────────────────────────────────

/** Zod schema for validating Session create payloads. */
export const sessionCreateSchema = z.object({
  sessionToken: z.string().min(1),
  userId: z.string().cuid(),
  expires: z.date(),
});

export type SessionCreateInput = z.infer<typeof sessionCreateSchema>;

/** Zod schema matching the full Prisma Session model. */
export const sessionSchema = z.object({
  id: z.string().cuid(),
  sessionToken: z.string(),
  userId: z.string().cuid(),
  expires: z.date(),
});

export type Session = z.infer<typeof sessionSchema>;

// ── VerificationToken ───────────────────────────────────────────────

/** Zod schema for validating VerificationToken payloads. */
export const verificationTokenSchema = z.object({
  identifier: z.string().min(1),
  token: z.string().min(1),
  expires: z.date(),
});

export type VerificationToken = z.infer<typeof verificationTokenSchema>;
