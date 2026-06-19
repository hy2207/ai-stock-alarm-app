# PostHog KPI Dashboard Guide

## Scope
EVT-Q01 guide for configuring PostHog dashboards from the SRS event taxonomy. Do not create `/api/events`; client events use `posthog-js`, and server events use `captureServerEvent()`.

## Required Events
- Client: `home_view`, `rec_card_impression`, `rec_card_click`, `rec_detail_view`, `bookmark_add`, `alert_set`, `broker_redirect`, `price_copy`, `execution_intent_submit`, `confidence_view`, `confidence_change`, `performance_card_view`, `reason_expand`, `push_open`, `deeplink_success`, `deeplink_fail`.
- Server: `rec_validation_failed`, `llm_call_failed`, `push_sent`.

## Common Properties
- Recommendation context: `recId`, `ticker`, `riskMode`, `page`.
- Push context: `route`, `scheduled`, `sent`, `failed`.
- Failure context: `reason`, `status`, `attempts`.
- Avoid raw user input, OAuth tokens, API keys, broker account data, or other secrets.

## Dashboard Tiles
- ADR: count of `execution_intent_submit` divided by unique `home_view` users.
- Card CTR: count of `rec_card_click` divided by count of `rec_card_impression`.
- Confidence Engagement Rate: unique users with `confidence_change` divided by unique users with `confidence_view`.
- Performance Card View Rate: unique users with `performance_card_view` divided by unique users with `rec_detail_view`.
- Push Open Rate: count of `push_open` divided by `push_sent.sent` where sent > 0.
- Deeplink Failure Rate: count of `deeplink_fail` divided by count of `push_open`.
- D7/D30 Retention: PostHog retention report based on signup/session events once auth/signup instrumentation is available.

## Alert Thresholds
- Any KPI drops by 20% or more from baseline for 24 hours: PM/analytics review.
- `deeplink_fail / push_open > 1%`: push/deeplink investigation.
- `llm_call_failed` spike or `rec_validation_failed` spike: LLM/provider investigation.
- `push_sent.failed / push_sent.scheduled > 1%`: OneSignal delivery investigation.

## Setup Steps
1. Verify all event names are present in `src/lib/dto/posthogEvents.ts`.
2. Verify no `src/app/api/events` route exists.
3. Create PostHog dashboard named `Decision Layer KPI`.
4. Add dashboard tiles using the formulas above.
5. Save screenshots or dashboard link as MON-003 console evidence.
