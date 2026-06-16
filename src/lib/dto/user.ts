import { z } from "zod";

// ── Field-level schemas ─────────────────────────────────────────────

const signupChannelSchema = z.enum(["email", "google", "kakao"]);

const timezoneSchema = z.string().min(1).default("Asia/Seoul");

// ── Full schema ─────────────────────────────────────────────────────

/** Zod schema for validating User create / update payloads.
 *
 *  Fields auto-managed by Prisma (id, createdAt, updatedAt) are omitted
 *  from input and asserted on the output shape.
 */
export const userCreateSchema = z.object({
  email: z.string().email().nullable().optional(),
  name: z.string().min(1).max(100).nullable().optional(),
  signupChannel: signupChannelSchema,
  timezone: timezoneSchema,
  consentPush: z.boolean().default(false),
});

/** Inferred create input type. */
export type UserCreateInput = z.infer<typeof userCreateSchema>;

/** Zod schema matching the full Prisma User model (for output assertions). */
export const userSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email().nullable(),
  name: z.string().nullable(),
  signupChannel: signupChannelSchema,
  timezone: z.string().min(1),
  consentPush: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/** Inferred full User type. */
export type User = z.infer<typeof userSchema>;
