# Push Consent / exitPrice Rename / Performance Evaluation Log - 2026-06-23

## Scope

This log covers three follow-up tasks completed after the risk-mode fix session on 2026-06-23.

- P1: Push notification consent UI
- P2: `stopPrice` → `exitPrice` field rename
- P3: Performance record evaluation automation

---

## P1 — Push Notification Consent UI

### Problem

`consentPush` existed in the `User` model and the morning briefing cron already filtered by it, but users had no way to opt in or out. The OneSignal SDK existed in `src/lib/push/onesignal.ts` but was never initialized in the browser and there was no UI surface.

### Changes

**New files:**

| File | Purpose |
|------|---------|
| `src/lib/dto/pushConsent.ts` | Zod schema: parses `"true"/"false"` string from FormData → boolean |
| `src/lib/actions/savePushConsent.ts` | Server Action: updates `User.consentPush` via Prisma |
| `src/app/components/OneSignalInit.tsx` | Client component: calls `initOneSignal()` once on mount |
| `src/app/components/PushConsentToggle.tsx` | Client toggle UI: OneSignal opt-in/out + server save + PostHog event |
| `src/lib/dto/__tests__/pushConsent.test.ts` | DTO schema unit tests |
| `src/lib/actions/__tests__/savePushConsent.test.ts` | Server action GWT tests |

**Updated files:**

- `src/app/layout.tsx`: Added OneSignal SDK script (`strategy="afterInteractive"`) and `<OneSignalInit />`.
- `src/app/settings/page.tsx`: Reads `consentPush` from DB, renders a new "알림 설정" section with `<PushConsentToggle>`.

### Behavior

1. User opens `/settings`.
2. Toggle shows current consent state (read from DB at page load).
3. Turning on: calls `subscribePush()` (browser push permission request via OneSignal) → `savePushConsent(true)` (server) → captures `push_consent_change` PostHog event.
4. Turning off: calls `unsubscribePush()` → `savePushConsent(false)`.
5. Morning briefing cron (`/api/cron/morning-briefing`) already filters `consentPush: true`, so the loop is now closed.

### Side fixes during P1

- `npx prisma generate` run to reflect `currentPrice` and `newsRationaleKo` fields added by yesterday's migrations.
- `prisma migrate deploy` applied two pending migrations (`20260623050000`, `20260623060000`) to the local `dev.db`.

---

## P2 — `stopPrice` → `exitPrice` Rename

### Problem

The DB column was `stopPrice` but the product meaning changed: it is now the actual sell/exit price, not a loss-cut stop. The UI already labeled it `매도 기준가`. Keeping `stopPrice` in the DB and DTO created a persistent mismatch.

### Changes

**Migration:**

```sql
-- prisma/migrations/20260623120000_rename_stop_price_to_exit_price/migration.sql
ALTER TABLE "RecommendationCard" RENAME COLUMN "stopPrice" TO "exitPrice";
```

**Schema:**

- `prisma/schema.prisma`: `stopPrice Float?` → `exitPrice Float?`

**Source files (31 files renamed via `sed`):**

All occurrences of `stopPrice` in `src/` replaced with `exitPrice`:
- `src/lib/dto/` — Zod schemas and tests
- `src/lib/llm/` — generation, persistence, prompt builder, tests
- `src/lib/mock/` — fixtures
- `src/lib/queries/` — query functions and tests
- `src/lib/recommendations/` — orchestration and tests
- `src/app/` — pages, components, types, mock data
- `src/vite-app/` — prototype pages, components, types, mock data

`stopPriceByMode` variable in one test renamed to `exitPriceByMode`.

LLM prompt text and example JSON updated so Gemini now returns `exitPrice` in its output.

**Not renamed:**

`src/imports/pasted_text/pasted-attachment.txt` — source import artifact, not active code.

### Verification

```
npm run typecheck  → pass
DATABASE_URL=file:./dev.db npm test → 57 files, 473 tests, all pass
```

---

## P3 — Performance Record Evaluation Automation

### Problem

`PerformanceRecord` existed in the schema and the archive/detail pages displayed the records, but:

1. Records were never created when a card was published (`persistRecommendationGeneration` only created the card and evidence snapshot).
2. There was no job to fill in `hitFlag` and `realizedReturn` after the hold window expired.
3. The archive and detail pages always showed "데이터 축적 중".

### Changes

**`persistRecommendationGeneration.ts`:**

Added nested `performanceRecords.create` inside the card create call so that every published card gets one pending `PerformanceRecord` at the time of generation:

```ts
performanceRecords: {
  create: {
    ticker: cardData.ticker,
    predictedDirection: cardData.direction,
    evaluationWindowDays: cardData.holdDays,
  },
},
```

**New core logic — `src/lib/perf/evaluatePerformance.ts`:**

Two exports:

- `computeEvaluation(direction, entryPrice, currentPrice, targetPrice)` — pure function:
  - BUY `realizedReturn` = `(current - entry) / entry × 100`
  - SELL `realizedReturn` = `(entry - current) / entry × 100`
  - `hitFlag` = true if price reached `targetPrice` in the predicted direction; falls back to `realizedReturn > 0` when no target.
- `runPerformanceEvaluation(now)` — orchestrator:
  - Loads `PerformanceRecord` rows where `hitFlag IS NULL` and `createdAt + evaluationWindowDays ≤ now`.
  - Groups by ticker, fetches `regularMarketPrice` from Yahoo Finance once per ticker.
  - Updates each record with rounded `realizedReturn`, `hitFlag`, and `evaluatedAt`.
  - Returns `{ evaluated, skipped, errors }`.

**New cron endpoint — `src/app/api/cron/evaluate-performance/route.ts`:**

- `GET` only, authenticated via `Authorization: Bearer CRON_SECRET`.
- Calls `runPerformanceEvaluation()`.
- Captures `performance_evaluation_run` PostHog server event.
- Returns `EvaluatePerformanceResponse` JSON.

**`vercel.json`:**

```json
{
  "path": "/api/cron/evaluate-performance",
  "schedule": "0 21 * * 1-5"
}
```

Runs Mon–Fri at 9 PM UTC (after US market close at 4 PM ET).

**`src/lib/dto/posthogEvents.ts`:**

- Added `push_consent_change` to `CLIENT_EVENT_NAMES` (P1 follow-up).
- Added `performance_evaluation_run` to `SERVER_EVENT_NAMES`.

**Tests:**

| File | Tests |
|------|-------|
| `src/lib/perf/__tests__/evaluatePerformance.test.ts` | 13 tests — pure function (BUY/SELL/no-target) + orchestrator GWT (no pending, expired BUY hit, not-yet-expired skip, Yahoo error, missing entryPrice) |
| `src/app/api/cron/evaluate-performance/__tests__/route.test.ts` | 5 tests — 401 cases, success response, 500 on throw, analytics capture |
| `src/lib/llm/__tests__/persistRecommendationGeneration.test.ts` | Updated to assert `performanceRecords.create` in the card create payload |
| `src/lib/analytics/__tests__/eventIntegration.test.ts` | Updated expected event counts (16→17 client, 3→4 server) |

### Verification

```
npm run typecheck  → pass
DATABASE_URL=file:./dev.db npm test → 59 files, 491 tests, all pass
```

---

## Final State After All Three Tasks

- Users can opt in/out of push notifications from `/settings`.
- The OneSignal SDK is initialized on every page load.
- DB field `stopPrice` is fully renamed to `exitPrice` across DB, schema, DTOs, LLM output, and UI.
- Every published recommendation card now generates a pending `PerformanceRecord`.
- A daily cron evaluates expired records using Yahoo Finance market data and fills in `hitFlag` and `realizedReturn`.
- Archive and detail pages will show real data once cards reach their hold window end.
- All event names used in P1 and P3 are registered in the PostHog taxonomy.
