# PostHog KPI Dashboard Guide

> **Applies to taxonomy:** `docs/taxonomy/posthog-events.md`
> **Schema reference:** `src/lib/dto/posthogEvents.ts`
> **Last updated:** 2026-06-08

## Overview

This guide explains how to configure PostHog dashboards and insights for the
ai-stock-alarm-app using the 19-event taxonomy (16 client + 3 server).

The following KPIs are defined in PRD v1:

| KPI | Target | Event dependency |
|-----|--------|------------------|
| **ADR (NS-01)** | Adoption & engagement per user | `home_view`, `rec_card_click` |
| **CTR** | Recommendation card click rate | `rec_card_impression`, `rec_card_click` |
| **Confidence Engagement Rate** | Users who interact with risk mode | `confidence_view`, `confidence_change` |
| **D7 Retention** | Day-7 returning user ratio | `home_view` |
| **D30 Retention** | Day-30 returning user ratio | `home_view` |

## Prerequisites

1. PostHog project is created and the API key is set in `NEXT_PUBLIC_POSTHOG_KEY`
2. `posthog-js` client SDK is initialized via `PostHogProvider.tsx`
3. Server events are captured via `captureServerEvent()` in `serverCapture.ts`
4. All 19 event types are emitting with correct properties (verified by TEST-F7-01)

## Dashboard Configuration

### Dashboard 1: Product Engagement (daily view)

**Panel 1 — Daily Active Users (DAU)**
- Event: `home_view`
- Metric: Unique users (count distinct `distinct_id`)
- Breakdown: None
- Date range: Last 30 days, rolling

**Panel 2 — Recommendation CTR**
- Formula: `uniq(rec_card_click)` / `uniq(rec_card_impression)` * 100
- Filter: Last 7 days
- Display: Percentage trend line

**Panel 3 — Confidence Mode Engagement**
- Funnel: Step 1 = `confidence_view`, Step 2 = `confidence_change`
- Window: 1 hour between steps
- Metric: Conversion rate

**Panel 4 — Top Clicked Tickers**
- Event: `rec_card_click`
- Breakdown: `ticker`
- Display: Bar chart (top 10)

### Dashboard 2: Operational Health

**Panel 1 — LLM Call Failures**
- Event: `llm_call_failed`
- Breakdown: `errorType` (`timeout`, `rate_limit`, `5xx`)
- Display: Area chart, daily count

**Panel 2 — Push Notification Delivery**
- Event: `push_sent`
- Metric: `recipientCount` vs `successCount`
- Display: Dual-axis time series

**Panel 3 — Validation Failures**
- Event: `rec_validation_failed`
- Breakdown: `validationRule`
- Display: Table sorted by count

### Dashboard 3: Retention & Stickiness

**Panel 1 — D7 / D30 Retention**
- Event: `home_view`
- Retention interval: Day 7, Day 30
- Display: Retention table (classic PostHog retention insight)

**Panel 2 — Deep Link Reliability**
- Event: `deeplink_success` and `deeplink_fail`
- Formula: `uniq(deeplink_success)` / (`uniq(deeplink_success)` + `uniq(deeplink_fail)`) * 100
- Target: >= 99%

## Event Properties Reference

All event properties are validated by Zod schemas in `posthogEvents.ts`.
Use `EVENT_PROPERTY_SCHEMAS` for runtime validation before capture.

### Common properties (present on every event)

- `distinct_id`: Set automatically by posthog-js (client) or passed explicitly (server)
- `$session_id`: Set automatically by posthog-js session recording

### Property validation rules

| Property | Type | Rule |
|----------|------|------|
| `cardId` | string | cuid format, non-empty |
| `ticker` | string | 1-10 chars, uppercase |
| `direction` | enum | `"BUY"` \| `"SELL"` |
| `confidenceScore` | enum | `"aggressive"` \| `"balanced"` \| `"conservative"` |
| `holdDays` | int | 1-10 (inclusive) |
| `latencyMs` | int | positive |
| `price` | number | positive |
| `errorType` | string | `"timeout"` \| `"rate_limit"` \| `"5xx"` |

## Taxonomy Validation

Before relying on dashboard data, run the integration tests:

```bash
npx vitest run src/lib/analytics/__tests__/posthogIntegration.test.ts
```

This validates:
- All 19 event names are correctly exported
- Server events capture without errors
- Client event factory produces 16 typed capture functions
- `/api/events` endpoint does NOT exist (REQ-NF-040 compliance)

## Migration Notes

- Adding new events: Add the event name and property schema to
  `src/lib/dto/posthogEvents.ts`, then update this guide.
- Removing events: Remove from `posthogEvents.ts` and remove any PostHog
  dashboard panels referencing the deprecated event.
- Property changes: Zod schemas are the source of truth. Update the schema,
  then remove old dashboard panels that reference removed properties.
