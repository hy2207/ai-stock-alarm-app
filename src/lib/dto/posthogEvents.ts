import { z } from "zod";
import { directionEnum, confidenceModeEnum } from "./recommendationCard";

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

// ── Zod enums ───────────────────────────────────────────────────────

export const clientEventNameSchema = z.enum(CLIENT_EVENT_NAMES);
export const serverEventNameSchema = z.enum(SERVER_EVENT_NAMES);
export const eventNameSchema = z.enum(ALL_EVENT_NAMES);

// ── Generic fallback property schema ─────────────────────────────────

/** Generic event properties schema -- a record of string-keyed values.
 *  Individual event types may define stricter property schemas.
 *  Retained for backward compatibility. */
export const eventPropertiesSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);

// ── Per-event property schemas ──────────────────────────────────────
// These define the expected properties for each PostHog event type,
// enabling validation at the point of capture.

// Client event property schemas

export const homeViewPropsSchema = z.object({
  /** How the user arrived at the home screen. */
  source: z.enum(["push", "manual"]).optional(),
});

export const recCardImpressionPropsSchema = z.object({
  cardId: z.string().min(1),
  ticker: z.string().min(1),
  direction: directionEnum,
  confidenceScore: confidenceModeEnum,
  positionType: z.enum(["long", "short"]).optional(),
  holdDays: z.number().int().min(1).max(10).optional(),
});

export const recCardClickPropsSchema = z.object({
  cardId: z.string().min(1),
  ticker: z.string().min(1),
  direction: directionEnum,
});

export const recDetailViewPropsSchema = z.object({
  cardId: z.string().min(1),
  ticker: z.string().min(1),
});

export const bookmarkAddPropsSchema = z.object({
  cardId: z.string().min(1),
  ticker: z.string().min(1),
});

export const alertSetPropsSchema = z.object({
  ticker: z.string().min(1),
  alertType: z.string().min(1),
  targetPrice: z.number().positive().optional(),
});

export const brokerRedirectPropsSchema = z.object({
  ticker: z.string().min(1),
  broker: z.string().min(1),
  action: z.enum(["buy", "sell"]),
});

export const priceCopyPropsSchema = z.object({
  ticker: z.string().min(1),
  price: z.number(),
  priceType: z.string().min(1),
});

export const executionIntentSubmitPropsSchema = z.object({
  ticker: z.string().min(1),
  direction: directionEnum,
  quantity: z.number().int().positive().optional(),
  orderType: z.string().min(1),
});

export const confidenceViewPropsSchema = z.object({
  cardId: z.string().min(1),
});

export const confidenceChangePropsSchema = z.object({
  cardId: z.string().min(1),
  from: confidenceModeEnum,
  to: confidenceModeEnum,
});

export const performanceCardViewPropsSchema = z.object({
  cardId: z.string().min(1),
});

export const reasonExpandPropsSchema = z.object({
  cardId: z.string().min(1),
  reasonCount: z.number().int().min(0),
});

export const pushOpenPropsSchema = z.object({
  pushId: z.string().min(1),
  campaignType: z.string().min(1),
});

export const deeplinkSuccessPropsSchema = z.object({
  target: z.string().min(1),
  latency: z.number().min(0),
});

export const deeplinkFailPropsSchema = z.object({
  target: z.string().min(1),
  reason: z.string().min(1),
});

// Server event property schemas

export const recValidationFailedPropsSchema = z.object({
  cardId: z.string().min(1).optional(),
  reason: z.string().min(1),
  validationRule: z.string().min(1),
});

export const llmCallFailedPropsSchema = z.object({
  model: z.string().min(1),
  errorType: z.string().min(1),
  reason: z.string().min(1),
  latencyMs: z.number().int().positive().optional(),
});

export const pushSentPropsSchema = z.object({
  recipientCount: z.number().int().min(0),
  successCount: z.number().int().min(0),
  failureCount: z.number().int().min(0),
});

// ── Re-exports for convenience ───────────────────────────────────────

export type HomeViewProps = z.infer<typeof homeViewPropsSchema>;
export type RecCardImpressionProps = z.infer<typeof recCardImpressionPropsSchema>;
export type RecCardClickProps = z.infer<typeof recCardClickPropsSchema>;
export type RecDetailViewProps = z.infer<typeof recDetailViewPropsSchema>;
export type BookmarkAddProps = z.infer<typeof bookmarkAddPropsSchema>;
export type AlertSetProps = z.infer<typeof alertSetPropsSchema>;
export type BrokerRedirectProps = z.infer<typeof brokerRedirectPropsSchema>;
export type PriceCopyProps = z.infer<typeof priceCopyPropsSchema>;
export type ExecutionIntentSubmitProps = z.infer<typeof executionIntentSubmitPropsSchema>;
export type ConfidenceViewProps = z.infer<typeof confidenceViewPropsSchema>;
export type ConfidenceChangeProps = z.infer<typeof confidenceChangePropsSchema>;
export type PerformanceCardViewProps = z.infer<typeof performanceCardViewPropsSchema>;
export type ReasonExpandProps = z.infer<typeof reasonExpandPropsSchema>;
export type PushOpenProps = z.infer<typeof pushOpenPropsSchema>;
export type DeeplinkSuccessProps = z.infer<typeof deeplinkSuccessPropsSchema>;
export type DeeplinkFailProps = z.infer<typeof deeplinkFailPropsSchema>;
export type RecValidationFailedProps = z.infer<typeof recValidationFailedPropsSchema>;
export type LlmCallFailedProps = z.infer<typeof llmCallFailedPropsSchema>;
export type PushSentProps = z.infer<typeof pushSentPropsSchema>;

// ── Property schema record ──────────────────────────────────────────

/** Record mapping every event name to its corresponding property Zod schema.
 *  Use this to look up the property schema for a given event at runtime. */
export const EVENT_PROPERTY_SCHEMAS = {
  home_view: homeViewPropsSchema,
  rec_card_impression: recCardImpressionPropsSchema,
  rec_card_click: recCardClickPropsSchema,
  rec_detail_view: recDetailViewPropsSchema,
  bookmark_add: bookmarkAddPropsSchema,
  alert_set: alertSetPropsSchema,
  broker_redirect: brokerRedirectPropsSchema,
  price_copy: priceCopyPropsSchema,
  execution_intent_submit: executionIntentSubmitPropsSchema,
  confidence_view: confidenceViewPropsSchema,
  confidence_change: confidenceChangePropsSchema,
  performance_card_view: performanceCardViewPropsSchema,
  reason_expand: reasonExpandPropsSchema,
  push_open: pushOpenPropsSchema,
  deeplink_success: deeplinkSuccessPropsSchema,
  deeplink_fail: deeplinkFailPropsSchema,
  rec_validation_failed: recValidationFailedPropsSchema,
  llm_call_failed: llmCallFailedPropsSchema,
  push_sent: pushSentPropsSchema,
} as const satisfies Record<EventName, z.ZodTypeAny>;

/** Union type of all per-event property types, keyed by event name. */
export type EventPropertySchemaMap = {
  [K in EventName]: z.infer<(typeof EVENT_PROPERTY_SCHEMAS)[K]>;
};

/** Type helper: get the inferred property type for a specific event. */
export type EventProperties<T extends EventName> = EventPropertySchemaMap[T];

// ── Legacy generic schema ───────────────────────────────────────────

/** Full event payload sent to PostHog (client-side or server-side).
 *  Uses a generic property record. For per-event property validation
 *  use `EVENT_PROPERTY_SCHEMAS[eventName]`. */
export const posthogEventSchema = z.object({
  event: eventNameSchema,
  properties: eventPropertiesSchema.optional(),
  timestamp: z.string().datetime().optional(),
  distinctId: z.string().min(1).optional(),
});

export type PosthogEventProperties = z.infer<typeof eventPropertiesSchema>;
export type PosthogEvent = z.infer<typeof posthogEventSchema>;
