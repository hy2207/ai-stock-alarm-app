# Env and External Evidence Runbook

This repo must not store real secrets. Use this checklist when closing the remaining console/token-bound issues.

## 1. Local `.env.local`

1. Copy `.env.example` to `.env.local`.
2. Fill local-only values:
   - `DATABASE_URL=file:./dev.db`
   - `NEXTAUTH_SECRET=<generate with openssl rand -base64 32>`
   - `NEXTAUTH_URL=http://localhost:3000`
   - `GEMINI_API_KEY=<Google AI Studio key>`
   - `GEMINI_MODEL=<approved Gemini model>`
   - `CRON_SECRET=<generate with openssl rand -base64 32>`
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
   - `NEXT_PUBLIC_POSTHOG_KEY=<PostHog project key>`
   - `NEXT_PUBLIC_POSTHOG_HOST=<PostHog host>`
   - `POSTHOG_API_KEY=<PostHog personal/project API key for server evidence only>`
   - `POSTHOG_HOST=<PostHog host>`
   - `NEXT_PUBLIC_ONESIGNAL_APP_ID=<OneSignal app id>`
   - `NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID=<OneSignal Safari web id if used>`
   - `ONESIGNAL_APP_ID=<OneSignal app id>`
   - `ONESIGNAL_REST_API_KEY=<OneSignal REST API key>`
3. Run `npm run typecheck`, `npm test`, and `npm run build`.

## 2. Vercel Evidence

Issues: #12, #26, #28, #29, #30.

1. Create or open the Vercel project connected to `hy2207/ai-stock-alarm-app`.
2. Confirm Git push deploys are enabled for the production branch.
3. Add production and preview env values in Vercel, using the same key names as `.env.example`.
4. Add `CRON_SECRET` before enabling `/api/cron/morning-briefing`.
5. Capture evidence:
   - Project Git integration screen.
   - Environment Variables screen with values hidden.
   - Latest deployment URL and status.
   - HTTPS/TLS result for the deployment URL.
   - Function duration and 5xx alert settings.

## 3. Supabase Evidence

Issues: #13, #19, #21, #31, #32.

1. Create or open the Supabase project.
2. Use the PostgreSQL connection pooler URL for `DATABASE_URL`.
3. Apply Prisma migrations against the pooler-backed database.
4. Confirm automatic backup/RPO settings for the active Supabase plan.
5. Confirm at-rest encryption and access policy screens.
6. Restrict production write/admin access to the approved operators.
7. Capture evidence with secrets hidden.

## 4. PostHog Evidence

Issues: #67, #118.

1. Create or open the PostHog project.
2. Set `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `POSTHOG_API_KEY`, and `POSTHOG_HOST`.
3. Verify these client events arrive: `home_view`, `rec_card_impression`, `rec_card_click`, `rec_detail_view`, `performance_card_view`, `push_open`, `deeplink_success`, `deeplink_fail`.
4. Build KPI dashboard panels for ADR, CTR, Confidence Engagement Rate, performance-card view rate, D7 retention, and D30 retention.
5. Set retention policy evidence for product events and raw logs.
6. Capture dashboard and retention-policy screenshots with keys hidden.

## 5. OneSignal Evidence

Issues: #75 and push portions of #84/#107.

1. Create or open the OneSignal app.
2. Set the Web SDK app id values in Vercel and local `.env.local`.
3. Set `ONESIGNAL_REST_API_KEY` only in server-side environments.
4. Send a staging morning briefing to a test subscriber.
5. Verify the notification opens `/` or `/recommendations/[recId]` within the target latency and emits `push_open` plus `deeplink_success`.
6. Add monitoring for send success rate, open rate, and deeplink failure rate.
7. Capture evidence with API keys hidden.

## 6. Close Criteria

- Close code-only issues after PR verification passes.
- Close console issues only after evidence exists and no secret value is visible in the issue comment.
- If evidence cannot be captured, leave the issue open with `blocked: needs-console-access`.
