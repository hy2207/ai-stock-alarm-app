---
name: 030-posthog-onesignal-ops
description: PostHog event taxonomy (REQ-FUNC-060), server capture helper patterns, OneSignal cron push, consent filtering — no parallel event REST API.
---
# PostHog + OneSignal operations

## PostHog client (browser)
- Initialize once (e.g. provider or layout effect); capture after meaningful UI milestones.
- Required **client** events include: `home_view`, `rec_card_impression`, `rec_card_click`, `rec_detail_view`, `bookmark_add`, `alert_set`, `broker_redirect`, `price_copy`, `execution_intent_submit`, `confidence_view`, `confidence_change`, `performance_card_view`, `reason_expand`, `push_open`, `deeplink_success`, `deeplink_fail` (full list: SRS REQ-FUNC-060).
- Attach stable properties: `userId` where allowed, `recId`, `ticker`, `riskMode`, etc. Keep PII policy minimal (REQ-NF-024).

## Server capture helper
- Use a tiny internal helper for: `rec_validation_failed`, `llm_call_failed`, `push_sent` (and other server-only signals).
- Must tolerate failures (try/catch, no user-facing 500 from analytics alone).

## OneSignal + cron
- `/api/cron/morning-briefing`: authenticate caller, iterate **consenting** users only, respect unsubscribe + `consentPush=false` (REQ-FUNC-052).
- Include deep link to home or card detail; log failures to provider response + PostHog.

## Anti-patterns
- **Do not** build **`POST /api/events`** or Prisma `EventLog` for product analytics (explicitly out of SRS v0.3).
- Do not block card render on analytics ACK; use SDK queue/retry (REQ-NF-014).
