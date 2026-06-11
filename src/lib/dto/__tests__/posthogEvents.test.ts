import { describe, it, expect } from "vitest";
import {
  clientEventNameSchema,
  serverEventNameSchema,
  eventNameSchema,
  posthogEventSchema,
  CLIENT_EVENT_NAMES,
  SERVER_EVENT_NAMES,
  ALL_EVENT_NAMES,
  // Per-event property schemas
  homeViewPropsSchema,
  recCardImpressionPropsSchema,
  recCardClickPropsSchema,
  recDetailViewPropsSchema,
  bookmarkAddPropsSchema,
  alertSetPropsSchema,
  brokerRedirectPropsSchema,
  priceCopyPropsSchema,
  executionIntentSubmitPropsSchema,
  confidenceViewPropsSchema,
  confidenceChangePropsSchema,
  performanceCardViewPropsSchema,
  reasonExpandPropsSchema,
  pushOpenPropsSchema,
  deeplinkSuccessPropsSchema,
  deeplinkFailPropsSchema,
  recValidationFailedPropsSchema,
  llmCallFailedPropsSchema,
  pushSentPropsSchema,
  EVENT_PROPERTY_SCHEMAS,
} from "../posthogEvents";

// ── Event name validation ───────────────────────────────────────────

describe("event name schemas", () => {
  it("accepts all 16 client event names", () => {
    for (const name of CLIENT_EVENT_NAMES) {
      expect(clientEventNameSchema.parse(name)).toBe(name);
    }
  });

  it("rejects a non-client event name", () => {
    const { success } = clientEventNameSchema.safeParse("llm_call_failed");
    expect(success).toBe(false);
  });

  it("accepts all 3 server event names", () => {
    for (const name of SERVER_EVENT_NAMES) {
      expect(serverEventNameSchema.parse(name)).toBe(name);
    }
  });

  it("accepts all 19 events in the combined schema", () => {
    for (const name of ALL_EVENT_NAMES) {
      expect(eventNameSchema.parse(name)).toBe(name);
    }
  });

  it("rejects an unknown event name", () => {
    const { success } = eventNameSchema.safeParse("unknown_event");
    expect(success).toBe(false);
  });
});

// ── Generic posthogEventSchema ──────────────────────────────────────

describe("posthogEventSchema (generic)", () => {
  it("parses a minimal event with only the event name", () => {
    const result = posthogEventSchema.parse({ event: "home_view" });
    expect(result.event).toBe("home_view");
  });

  it("parses an event with properties", () => {
    const result = posthogEventSchema.parse({
      event: "rec_card_click",
      properties: { ticker: "AAPL", direction: "BUY" },
    });
    expect(result.properties?.ticker).toBe("AAPL");
  });

  it("parses an event with timestamp and distinctId", () => {
    const result = posthogEventSchema.parse({
      event: "push_sent",
      distinctId: "user_abc",
      timestamp: "2026-05-28T00:00:00Z",
    });
    expect(result.distinctId).toBe("user_abc");
  });

  it("rejects a payload with a non-string distinctId", () => {
    const { success } = posthogEventSchema.safeParse({
      event: "home_view",
      distinctId: 123,
    });
    expect(success).toBe(false);
  });

  it("rejects a payload missing the event field", () => {
    const { success } = posthogEventSchema.safeParse({
      properties: {},
    });
    expect(success).toBe(false);
  });
});

// ── Per-event property schema validation ────────────────────────────

describe("client event property schemas", () => {
  describe("homeViewPropsSchema", () => {
    it("accepts valid push source", () => {
      const { success } = homeViewPropsSchema.safeParse({ source: "push" });
      expect(success).toBe(true);
    });

    it("accepts valid manual source", () => {
      const { success } = homeViewPropsSchema.safeParse({ source: "manual" });
      expect(success).toBe(true);
    });

    it("accepts empty props (all optional)", () => {
      const { success } = homeViewPropsSchema.safeParse({});
      expect(success).toBe(true);
    });

    it("rejects invalid source value", () => {
      const { success } = homeViewPropsSchema.safeParse({ source: "email" });
      expect(success).toBe(false);
    });
  });

  describe("recCardImpressionPropsSchema", () => {
    const valid = () => ({
      cardId: "cm8abc123",
      ticker: "AAPL",
      direction: "BUY" as const,
      confidenceScore: "aggressive" as const,
    });

    it("accepts minimal required props", () => {
      const { success } = recCardImpressionPropsSchema.safeParse(valid());
      expect(success).toBe(true);
    });

    it("accepts with optional fields", () => {
      const { success } = recCardImpressionPropsSchema.safeParse({
        ...valid(),
        positionType: "long",
        holdDays: 5,
      });
      expect(success).toBe(true);
    });

    it("rejects missing cardId", () => {
      const { cardId, ...rest } = valid();
      const { success } = recCardImpressionPropsSchema.safeParse(rest);
      expect(success).toBe(false);
    });

    it("rejects invalid direction", () => {
      const { success } = recCardImpressionPropsSchema.safeParse({
        ...valid(),
        direction: "HOLD",
      });
      expect(success).toBe(false);
    });

    it("rejects invalid confidenceScore", () => {
      const { success } = recCardImpressionPropsSchema.safeParse({
        ...valid(),
        confidenceScore: "ultra",
      });
      expect(success).toBe(false);
    });

    it("rejects holdDays out of range", () => {
      const { success } = recCardImpressionPropsSchema.safeParse({
        ...valid(),
        holdDays: 15,
      });
      expect(success).toBe(false);
    });
  });

  describe("recCardClickPropsSchema", () => {
    const valid = {
      cardId: "cm8abc123",
      ticker: "AAPL",
      direction: "BUY" as const,
    };

    it("accepts valid click props", () => {
      const { success } = recCardClickPropsSchema.safeParse(valid);
      expect(success).toBe(true);
    });

    it("rejects missing ticker", () => {
      const { ticker, ...rest } = valid;
      const { success } = recCardClickPropsSchema.safeParse(rest);
      expect(success).toBe(false);
    });
  });

  describe("recDetailViewPropsSchema", () => {
    it("accepts valid detail view props", () => {
      const { success } = recDetailViewPropsSchema.safeParse({
        cardId: "cm8abc123",
        ticker: "AAPL",
      });
      expect(success).toBe(true);
    });
  });

  describe("bookmarkAddPropsSchema", () => {
    it("accepts valid bookmark add props", () => {
      const { success } = bookmarkAddPropsSchema.safeParse({
        cardId: "cm8abc123",
        ticker: "AAPL",
      });
      expect(success).toBe(true);
    });
  });

  describe("alertSetPropsSchema", () => {
    const valid = { ticker: "AAPL", alertType: "price_target" };

    it("accepts minimal required props", () => {
      const { success } = alertSetPropsSchema.safeParse(valid);
      expect(success).toBe(true);
    });

    it("accepts with targetPrice", () => {
      const { success } = alertSetPropsSchema.safeParse({
        ...valid,
        targetPrice: 250.5,
      });
      expect(success).toBe(true);
    });

    it("rejects negative targetPrice", () => {
      const { success } = alertSetPropsSchema.safeParse({
        ...valid,
        targetPrice: -10,
      });
      expect(success).toBe(false);
    });

    it("rejects empty ticker", () => {
      const { success } = alertSetPropsSchema.safeParse({
        ticker: "",
        alertType: "price_target",
      });
      expect(success).toBe(false);
    });
  });

  describe("brokerRedirectPropsSchema", () => {
    it("accepts valid redirect props", () => {
      const { success } = brokerRedirectPropsSchema.safeParse({
        ticker: "AAPL",
        broker: "kis",
        action: "buy",
      });
      expect(success).toBe(true);
    });

    it("rejects invalid action", () => {
      const { success } = brokerRedirectPropsSchema.safeParse({
        ticker: "AAPL",
        broker: "kis",
        action: "hold",
      });
      expect(success).toBe(false);
    });
  });

  describe("priceCopyPropsSchema", () => {
    it("accepts valid price copy props", () => {
      const { success } = priceCopyPropsSchema.safeParse({
        ticker: "AAPL",
        price: 245.3,
        priceType: "entry",
      });
      expect(success).toBe(true);
    });
  });

  describe("executionIntentSubmitPropsSchema", () => {
    const valid = {
      ticker: "AAPL",
      direction: "BUY" as const,
      orderType: "market",
    };

    it("accepts minimal required props", () => {
      const { success } = executionIntentSubmitPropsSchema.safeParse(valid);
      expect(success).toBe(true);
    });

    it("accepts with quantity", () => {
      const { success } = executionIntentSubmitPropsSchema.safeParse({
        ...valid,
        quantity: 10,
      });
      expect(success).toBe(true);
    });

    it("rejects negative quantity", () => {
      const { success } = executionIntentSubmitPropsSchema.safeParse({
        ...valid,
        quantity: -1,
      });
      expect(success).toBe(false);
    });
  });

  describe("confidenceViewPropsSchema", () => {
    it("accepts valid confidence view props", () => {
      const { success } = confidenceViewPropsSchema.safeParse({
        cardId: "cm8abc123",
      });
      expect(success).toBe(true);
    });
  });

  describe("confidenceChangePropsSchema", () => {
    it("accepts valid mode change", () => {
      const { success } = confidenceChangePropsSchema.safeParse({
        cardId: "cm8abc123",
        from: "balanced",
        to: "aggressive",
      });
      expect(success).toBe(true);
    });

    it("rejects invalid mode value", () => {
      const { success } = confidenceChangePropsSchema.safeParse({
        cardId: "cm8abc123",
        from: "extreme",
        to: "aggressive",
      });
      expect(success).toBe(false);
    });
  });

  describe("performanceCardViewPropsSchema", () => {
    it("accepts valid props", () => {
      const { success } = performanceCardViewPropsSchema.safeParse({
        cardId: "cm8abc123",
      });
      expect(success).toBe(true);
    });
  });

  describe("reasonExpandPropsSchema", () => {
    it("accepts valid props", () => {
      const { success } = reasonExpandPropsSchema.safeParse({
        cardId: "cm8abc123",
        reasonCount: 3,
      });
      expect(success).toBe(true);
    });

    it("rejects negative reasonCount", () => {
      const { success } = reasonExpandPropsSchema.safeParse({
        cardId: "cm8abc123",
        reasonCount: -1,
      });
      expect(success).toBe(false);
    });
  });

  describe("pushOpenPropsSchema", () => {
    it("accepts valid push open props", () => {
      const { success } = pushOpenPropsSchema.safeParse({
        pushId: "push_abc",
        campaignType: "morning_briefing",
      });
      expect(success).toBe(true);
    });
  });

  describe("deeplinkSuccessPropsSchema", () => {
    it("accepts valid deeplink success props", () => {
      const { success } = deeplinkSuccessPropsSchema.safeParse({
        target: "/recommendations/cm8abc123",
        latency: 350,
      });
      expect(success).toBe(true);
    });
  });

  describe("deeplinkFailPropsSchema", () => {
    it("accepts valid deeplink fail props", () => {
      const { success } = deeplinkFailPropsSchema.safeParse({
        target: "/recommendations/invalid",
        reason: "not_found",
      });
      expect(success).toBe(true);
    });
  });
});

describe("server event property schemas", () => {
  describe("recValidationFailedPropsSchema", () => {
    it("accepts without cardId", () => {
      const { success } = recValidationFailedPropsSchema.safeParse({
        reason: "Missing entry price",
        validationRule: "entryOrRange",
      });
      expect(success).toBe(true);
    });

    it("accepts with cardId", () => {
      const { success } = recValidationFailedPropsSchema.safeParse({
        cardId: "cm8abc123",
        reason: "Missing entry price",
        validationRule: "entryOrRange",
      });
      expect(success).toBe(true);
    });

    it("rejects empty reason", () => {
      const { success } = recValidationFailedPropsSchema.safeParse({
        reason: "",
        validationRule: "entryOrRange",
      });
      expect(success).toBe(false);
    });

    it("rejects empty validationRule", () => {
      const { success } = recValidationFailedPropsSchema.safeParse({
        reason: "Missing entry price",
        validationRule: "",
      });
      expect(success).toBe(false);
    });
  });

  describe("llmCallFailedPropsSchema", () => {
    const valid = {
      model: "gemini-2.0-flash",
      errorType: "timeout",
      reason: "LLM did not respond within 30s",
    };

    it("accepts minimal required props", () => {
      const { success } = llmCallFailedPropsSchema.safeParse(valid);
      expect(success).toBe(true);
    });

    it("accepts with latencyMs", () => {
      const { success } = llmCallFailedPropsSchema.safeParse({
        ...valid,
        latencyMs: 32000,
      });
      expect(success).toBe(true);
    });

    it("rejects missing model", () => {
      const { model, ...rest } = valid;
      const { success } = llmCallFailedPropsSchema.safeParse(rest);
      expect(success).toBe(false);
    });
  });

  describe("pushSentPropsSchema", () => {
    it("accepts valid push stats", () => {
      const { success } = pushSentPropsSchema.safeParse({
        recipientCount: 100,
        successCount: 98,
        failureCount: 2,
      });
      expect(success).toBe(true);
    });

    it("accepts zero counts", () => {
      const { success } = pushSentPropsSchema.safeParse({
        recipientCount: 0,
        successCount: 0,
        failureCount: 0,
      });
      expect(success).toBe(true);
    });

    it("rejects negative failureCount", () => {
      const { success } = pushSentPropsSchema.safeParse({
        recipientCount: 100,
        successCount: 98,
        failureCount: -1,
      });
      expect(success).toBe(false);
    });
  });
});

// ── EVENT_PROPERTY_SCHEMAS record ────────────────────────────────────

describe("EVENT_PROPERTY_SCHEMAS", () => {
  it("contains an entry for every ALL_EVENT_NAMES", () => {
    expect(Object.keys(EVENT_PROPERTY_SCHEMAS).sort()).toEqual(
      [...ALL_EVENT_NAMES].sort(),
    );
  });

  it("validates properties for home_view through the record", () => {
    const schema = EVENT_PROPERTY_SCHEMAS.home_view;
    const { success } = schema.safeParse({ source: "push" });
    expect(success).toBe(true);
  });

  it("validates properties for llm_call_failed through the record", () => {
    const schema = EVENT_PROPERTY_SCHEMAS.llm_call_failed;
    const { success } = schema.safeParse({
      model: "gemini-2.0-flash",
      errorType: "timeout",
      reason: "timeout",
    });
    expect(success).toBe(true);
  });
});
