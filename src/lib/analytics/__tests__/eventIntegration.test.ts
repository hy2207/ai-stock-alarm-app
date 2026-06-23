import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CLIENT_EVENT_NAMES,
  SERVER_EVENT_NAMES,
  clientEventNameSchema,
  serverEventNameSchema,
} from "@/lib/dto/posthogEvents";

const requiredClientEvents = [
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
  "push_consent_change",
] as const;

const requiredServerEvents = [
  "rec_validation_failed",
  "llm_call_failed",
  "push_sent",
  "performance_evaluation_run",
] as const;

describe("PostHog event integration contract", () => {
  it("GWT: Given SRS client events When validating taxonomy Then all 17 events are accepted", () => {
    expect(CLIENT_EVENT_NAMES).toHaveLength(17);
    for (const eventName of requiredClientEvents) {
      expect(clientEventNameSchema.parse(eventName)).toBe(eventName);
    }
  });

  it("GWT: Given SRS server events When validating taxonomy Then all 4 events are accepted", () => {
    expect(SERVER_EVENT_NAMES).toHaveLength(4);
    for (const eventName of requiredServerEvents) {
      expect(serverEventNameSchema.parse(eventName)).toBe(eventName);
    }
  });

  it("GWT: Given analytics architecture When checking routes Then /api/events is not implemented", () => {
    const apiEventsRoute = join(process.cwd(), "src/app/api/events/route.ts");
    expect(existsSync(apiEventsRoute)).toBe(false);
  });
});
