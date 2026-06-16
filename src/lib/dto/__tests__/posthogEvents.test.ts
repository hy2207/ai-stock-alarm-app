import { describe, it, expect } from "vitest";
import {
  clientEventNameSchema,
  serverEventNameSchema,
  eventNameSchema,
  posthogEventSchema,
  CLIENT_EVENT_NAMES,
  SERVER_EVENT_NAMES,
} from "../posthogEvents";

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
    const { success } = eventNameSchema.safeParse("home_view");
    expect(success).toBe(true);
  });

  it("rejects an unknown event name", () => {
    const { success } = eventNameSchema.safeParse("unknown_event");
    expect(success).toBe(false);
  });
});

describe("posthogEventSchema", () => {
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
