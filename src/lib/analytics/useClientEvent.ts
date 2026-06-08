"use client";

import { useCallback } from "react";
import { usePostHog } from "./PostHogProvider";
import {
  type ClientEventName,
  type EventName,
  EVENT_PROPERTY_SCHEMAS,
} from "../dto/posthogEvents";

// ── Pure factory (testable without React) ─────────────────────────

export interface ClientEventCapturers {
  captureEvent: <T extends EventName>(
    event: T,
    properties?: Record<string, unknown>,
  ) => void;
  captureHomeView: (props?: { source?: "push" | "manual" }) => void;
  captureRecCardImpression: (props: {
    cardId: string; ticker: string; direction: "BUY" | "SELL" | "HOLD";
    confidenceScore: "aggressive" | "balanced" | "conservative";
    positionType?: "long" | "short"; holdDays?: number;
  }) => void;
  captureRecCardClick: (props: { cardId: string; ticker: string; direction: "BUY" | "SELL" | "HOLD" }) => void;
  captureRecDetailView: (props: { cardId: string; ticker: string }) => void;
  captureBookmarkAdd: (props: { cardId: string; ticker: string }) => void;
  captureAlertSet: (props: { ticker: string; alertType: string; targetPrice?: number }) => void;
  captureBrokerRedirect: (props: { ticker: string; broker: string; action: "buy" | "sell" }) => void;
  capturePriceCopy: (props: { ticker: string; price: number; priceType: string }) => void;
  captureExecutionIntentSubmit: (props: { ticker: string; direction: "BUY" | "SELL" | "HOLD"; quantity?: number; orderType: string }) => void;
  captureConfidenceView: (props: { cardId: string }) => void;
  captureConfidenceChange: (props: { cardId: string; from: "aggressive" | "balanced" | "conservative"; to: "aggressive" | "balanced" | "conservative" }) => void;
  capturePerformanceCardView: (props: { cardId: string }) => void;
  captureReasonExpand: (props: { cardId: string; reasonCount: number }) => void;
  capturePushOpen: (props: { pushId: string; campaignType: string }) => void;
  captureDeeplinkSuccess: (props: { target: string; latency: number }) => void;
  captureDeeplinkFail: (props: { target: string; reason: string }) => void;
}

/** Factory that creates typed per-event capture functions from a base
 *  capture function.  Exported so tests can exercise it without React. */
export function createClientEventCapturers(
  capture: (event: EventName, properties?: Record<string, unknown>) => void,
): ClientEventCapturers {
  const captureEvent = <T extends EventName>(
    event: T,
    properties?: Record<string, unknown>,
  ) => {
    capture(event as EventName, properties);
  };

  return {
    captureEvent,
    captureHomeView: (props?) => captureEvent("home_view" as ClientEventName, props as Record<string, unknown>),
    captureRecCardImpression: (props) => captureEvent("rec_card_impression" as ClientEventName, props as Record<string, unknown>),
    captureRecCardClick: (props) => captureEvent("rec_card_click" as ClientEventName, props as Record<string, unknown>),
    captureRecDetailView: (props) => captureEvent("rec_detail_view" as ClientEventName, props as Record<string, unknown>),
    captureBookmarkAdd: (props) => captureEvent("bookmark_add" as ClientEventName, props as Record<string, unknown>),
    captureAlertSet: (props) => captureEvent("alert_set" as ClientEventName, props as Record<string, unknown>),
    captureBrokerRedirect: (props) => captureEvent("broker_redirect" as ClientEventName, props as Record<string, unknown>),
    capturePriceCopy: (props) => captureEvent("price_copy" as ClientEventName, props as Record<string, unknown>),
    captureExecutionIntentSubmit: (props) => captureEvent("execution_intent_submit" as ClientEventName, props as Record<string, unknown>),
    captureConfidenceView: (props) => captureEvent("confidence_view" as ClientEventName, props as Record<string, unknown>),
    captureConfidenceChange: (props) => captureEvent("confidence_change" as ClientEventName, props as Record<string, unknown>),
    capturePerformanceCardView: (props) => captureEvent("performance_card_view" as ClientEventName, props as Record<string, unknown>),
    captureReasonExpand: (props) => captureEvent("reason_expand" as ClientEventName, props as Record<string, unknown>),
    capturePushOpen: (props) => captureEvent("push_open" as ClientEventName, props as Record<string, unknown>),
    captureDeeplinkSuccess: (props) => captureEvent("deeplink_success" as ClientEventName, props as Record<string, unknown>),
    captureDeeplinkFail: (props) => captureEvent("deeplink_fail" as ClientEventName, props as Record<string, unknown>),
  };
}

// ── React hook (thin wrapper around the factory) ──────────────────

/**
 * Typed hook for capturing client-side PostHog events.
 *
 * Returns per-event capture functions that accept only the correct
 * properties for that event type, as defined in DTO-009.
 */
export function useClientEvent(): ClientEventCapturers {
  const { capture } = usePostHog();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(() => createClientEventCapturers(capture), [capture])();
}
