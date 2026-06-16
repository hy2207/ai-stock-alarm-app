import { z } from "zod";

// ── Event name constants ────────────────────────────────────────────

export const CLIENT_EVENT_NAMES = [
  "home_view",
  "rec_card_impression",
  "rec_card_click",
  "rec_detail_view",
  "bookmark_add",
  "alert_set",
  "broker_redirect",
  "price_copy",
  "execution_intent_submit",
  "confidence_view",
  "confidence_change",
  "performance_card_view",
  "reason_expand",
  "push_open",
  "deeplink_success",
  "deeplink_fail",
] as const;

export const SERVER_EVENT_NAMES = [
  "rec_validation_failed",
  "llm_call_failed",
  "push_sent",
] as const;

export const ALL_EVENT_NAMES = [
  ...CLIENT_EVENT_NAMES,
  ...SERVER_EVENT_NAMES,
] as const;

export type ClientEventName = (typeof CLIENT_EVENT_NAMES)[number];
export type ServerEventName = (typeof SERVER_EVENT_NAMES)[number];
export type EventName = (typeof ALL_EVENT_NAMES)[number];

// ── Zod schemas ─────────────────────────────────────────────────────

export const clientEventNameSchema = z.enum(CLIENT_EVENT_NAMES);
export const serverEventNameSchema = z.enum(SERVER_EVENT_NAMES);
export const eventNameSchema = z.enum(ALL_EVENT_NAMES);

/** Generic event properties schema — a record of string-keyed values.
 *  Individual event types may define stricter property schemas. */
export const eventPropertiesSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);

/** Full event payload sent to PostHog (client-side or server-side). */
export const posthogEventSchema = z.object({
  event: eventNameSchema,
  properties: eventPropertiesSchema.optional(),
  timestamp: z.string().datetime().optional(),
  distinctId: z.string().min(1).optional(),
});

export type PosthogEventProperties = z.infer<typeof eventPropertiesSchema>;
export type PosthogEvent = z.infer<typeof posthogEventSchema>;
