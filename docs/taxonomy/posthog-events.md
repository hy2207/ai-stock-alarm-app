# PostHog Event Taxonomy

> **Schema reference:** `src/lib/dto/posthogEvents.ts`
> **Last updated:** 2026-06-08

This document catalogs all 19 PostHog events (16 client + 3 server) with their
properties, types, and validation rules. The Zod schemas in
`posthogEvents.ts` are the source of truth; this document is a human-readable
summary.

## Client events (16)

Captured client-side via `posthog-js`. Each event has typed properties
defined in its corresponding Zod schema.

| # | Event | Description | Key properties |
|---|-------|-------------|----------------|
| 1 | `home_view` | User viewed the home screen | `source?`: `"push"` \| `"manual"` |
| 2 | `rec_card_impression` | Recommendation card appeared in viewport | `cardId`, `ticker`, `direction`(`BUY`\|`SELL`), `confidenceScore`(`aggressive`\|`balanced`\|`conservative`), `positionType?`, `holdDays?`(1-10) |
| 3 | `rec_card_click` | User tapped/clicked a recommendation card | `cardId`, `ticker`, `direction` |
| 4 | `rec_detail_view` | User entered the recommendation detail screen | `cardId`, `ticker` |
| 5 | `bookmark_add` | User bookmarked a recommendation | `cardId`, `ticker` |
| 6 | `alert_set` | User set a price alert | `ticker`, `alertType`, `targetPrice?`(positive) |
| 7 | `broker_redirect` | User clicked broker link | `ticker`, `broker`, `action`(`buy`\|`sell`) |
| 8 | `price_copy` | User copied a price to clipboard | `ticker`, `price`, `priceType` |
| 9 | `execution_intent_submit` | User submitted order intent | `ticker`, `direction`(`BUY`\|`SELL`), `orderType`, `quantity?`(positive int) |
| 10 | `confidence_view` | User viewed the confidence score selector | `cardId` |
| 11 | `confidence_change` | User switched confidence mode | `cardId`, `from`(risk mode), `to`(risk mode) |
| 12 | `performance_card_view` | User viewed the trust-layer performance card | `cardId` |
| 13 | `reason_expand` | User expanded to see all reasoning lines | `cardId`, `reasonCount`(int >= 0) |
| 14 | `push_open` | User opened a push notification | `pushId`, `campaignType` |
| 15 | `deeplink_success` | Deep link resolved successfully | `target`, `latency`(ms, >= 0) |
| 16 | `deeplink_fail` | Deep link failed to resolve | `target`, `reason` |

## Server events (3)

Captured server-side via `captureServerEvent()` helper. These record
operational outcomes.

| # | Event | Description | Key properties |
|---|-------|-------------|----------------|
| 17 | `rec_validation_failed` | LLM output failed Zod validation | `cardId?`, `reason`, `validationRule` |
| 18 | `llm_call_failed` | LLM API call error (timeout, rate limit, 5xx) | `model`, `errorType`, `reason`, `latencyMs?`(positive int) |
| 19 | `push_sent` | Push notification batch completed | `recipientCount`(int >= 0), `successCount`(int >= 0), `failureCount`(int >= 0) |

## How to use

### Client-side capture (via `posthog-js`)

```typescript
import posthog from "posthog-js";
import type { RecCardClickProps } from "@/lib/dto/posthogEvents";

const props: RecCardClickProps = {
  cardId: "cm8abc123",
  ticker: "AAPL",
  direction: "BUY",
};

posthog.capture("rec_card_click", props);
```

### Server-side capture (via helper)

```typescript
import { captureServerEvent } from "@/lib/analytics/serverCapture";

await captureServerEvent("llm_call_failed", {
  model: "gemini-2.0-flash",
  errorType: "timeout",
  reason: "LLM did not respond within 30s",
  latencyMs: 32000,
});
```

### Validating event properties at runtime

```typescript
import { EVENT_PROPERTY_SCHEMAS } from "@/lib/dto/posthogEvents";
import type { EventName } from "@/lib/dto/posthogEvents";

function captureValidated(event: EventName, properties: unknown) {
  const schema = EVENT_PROPERTY_SCHEMAS[event];
  const parsed = schema.parse(properties);
  // safe to use `parsed` with full TypeScript narrowing
  return parsed;
}
```

## Schema location

- Property Zod schemas: `src/lib/dto/posthogEvents.ts`
- Per-event inferred types: each schema exports a `z.infer` type (e.g., `RecCardClickProps`)
- Property schema record: `EVENT_PROPERTY_SCHEMAS` constant keyed by event name
- Server capture helper: `src/lib/analytics/serverCapture.ts`
- PostHog client initialization: `src/lib/analytics/PostHogProvider.tsx` (or equivalent)
