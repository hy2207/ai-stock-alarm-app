# Disaster Recovery Runbook

## Purpose
AVAIL-002 runbook for restoring the Decision Layer service within RTO <= 4 hours while keeping RPO, database connectivity, and analytics/push dependencies visible.

## Severity Triage
- SEV1: production app unavailable, auth unavailable, database unavailable, or recommendation card generation unavailable for most users.
- SEV2: degraded recommendations, stale market data, push delivery failure, or PostHog event gap without full app outage.
- SEV3: isolated UX or analytics issue with no user-facing decision flow outage.

## Recovery Checklist
1. Confirm scope in Vercel deployment status, function logs, and `/api/admin/health`.
2. Check Supabase status, connection pooler status, and recent backup availability.
3. Check provider status for Gemini, Yahoo Finance/Finnhub, PostHog, and OneSignal.
4. If database is unavailable, pause write-heavy jobs and verify latest restorable backup before any migration or rollback.
5. If only market data or LLM is unavailable, serve No Call responses instead of exposing 5xx.
6. If push delivery is unavailable, disable or skip morning briefing until OneSignal recovers.
7. Record timeline, impact, suspected cause, recovery action, and follow-up issue.

## RTO / RPO Criteria
- RTO target: service restored or acceptable degraded mode within 4 hours.
- RPO target: use Supabase backup/PITR evidence from console; if RPO exceeds configured target, open a follow-up incident.
- Connection pool target: production must use Supabase pooler or Prisma Accelerate before high-traffic preview/production rollout.

## Validation
- `/api/admin/health` returns a valid DTO with freshness and nullRate.
- Authenticated home can show cards or No Call without 5xx.
- Recommendation detail does not expose chart/indicator widgets in the main fold.
- PostHog server events remain best-effort and do not block user responses.
- OneSignal cron rejects unauthorized requests and does not send to `consentPush=false` users.

## Evidence To Attach To Issue
- Vercel incident/deployment link.
- Supabase backup/pooler screenshot or exported settings summary.
- `/api/admin/health` response sample with timestamp.
- Post-incident follow-up issue links.
