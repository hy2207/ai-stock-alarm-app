# SEC-004 Data Minimization Security Review

> **Task:** SEC-004 (#15)
> **Date:** 2026-06-08
> **Reference:** SRS §4.2.3 REQ-NF-024, REQ-NF-026, CON-008

## Scope

Verify that the ai-stock-alarm-app collects only the minimum personal data
required and does not store broker account numbers, trading credentials, or
order execution permissions anywhere in the system (code, database, logs,
third-party services).

## Checklist

### 1. Prisma schema — personal data fields

| Model | Fields stored | Minimized? | Notes |
|-------|--------------|------------|-------|
| `User` | id, email?, name?, image?, signupChannel, timezone, consentPush | ✅ Yes | Only OAuth profile fields needed for auth + personalization. No address, phone, SSN, or financial account. |
| `RiskProfile` | riskMode (string enum) | ✅ Yes | Only decision-mode preference. No financial history. |
| `Watchlist` | ticker?, sector?, priority | ✅ Yes | Investment interest — not actual holdings or account data. |
| `RecommendationCard` | ticker, direction, prices, holdDays, confidence, reasonLine | ✅ Yes | Market-facing data only — no personal financial info. |
| `EvidenceSnapshot` | signal scores, pattern tag | ✅ Yes | Computed market signals only. |
| `PerformanceRecord` | ticker, predictedDirection, realizedReturn, hitFlag | ✅ Yes | Aggregate portfolio performance — not position-level. No account linkage. |
| `Account` | OAuth tokens (NextAuth) | ⚠️ Accepted | Required for OAuth session management. Tokens stored encrypted at rest by Supabase. |
| `Session` | sessionToken, expires | ✅ Yes | Standard session management. |

**Verdict:** All personal data fields are limited to what is strictly necessary
for authentication, personalization, and product delivery. No financial account
numbers, SSN, address, or phone numbers are stored.

### 2. Broker account / order permission check (CON-008, REQ-NF-026)

| Check item | Status | Evidence |
|------------|--------|----------|
| Broker account model in Prisma | ❌ Not present | No `BrokerAccount`, `Order`, or `Trade` model exists |
| Broker API credentials in env | ❌ Not present | No `BROKER_API_KEY`, `BROKER_SECRET` in `.env.example` |
| Broker OAuth flow in auth | ❌ Not present | Only Google/Kakao OAuth — no trading platform OAuth |
| Order execution code | ❌ Not present | No buy/sell execution functions anywhere in `src/` |
| Broker redirect function | ✅ Present as analytics | `broker_redirect` event in PostHog taxonomy — click tracking, not execution |

**Verdict:** CON-008 is satisfied. No broker account or order permission data
is stored, integrated, or executable in v1.0.

### 3. Secrets management check (REQ-NF-022)

| Secret | Location | Plain text in code? | Plain text in logs? |
|--------|----------|-------------------|---------------------|
| `GEMINI_API_KEY` | Vercel env | ❌ Not in source | ⚠️ `serverCapture.ts` logs are generic ("Failed to capture") |
| `CRON_SECRET` | Vercel env | ❌ Not in source | ✅ Validation logs do not leak secret value |
| `NEXTAUTH_SECRET` | Vercel env | ❌ Not in source | ✅ No secret logging |
| `POSTHOG_API_KEY` | Vercel env / `NEXT_PUBLIC_POSTHOG_KEY` | ⚠️ Public client key only | ✅ `serverCapture.ts` only warns on invalid event names |
| `ONESIGNAL_REST_API_KEY` | Vercel env | ❌ Not in source | ✅ Not logged |

**Verdict:** No secrets are hardcoded or logged in plain text. The
`NEXT_PUBLIC_POSTHOG_KEY` is intentionally public (client-side SDK key).

### 4. Third-party service data sharing

| Service | Data sent | Minimized? |
|---------|-----------|------------|
| **PostHog** | Event names + typed properties (ticker, cardId, direction, etc.) | ✅ Yes — no PII in events beyond distinctId (derived from user ID) |
| **OneSignal** | Push notification target (by external user ID) | ✅ Yes — no personal content; only notification metadata |
| **Google Gemini** | Market data + watchlist (no PII) | ✅ Yes — prompt includes ticker, OHLCV, risk mode; no user name/email |
| **Yahoo Finance / Finnhub** | Ticker symbol | ✅ Yes — public market data queries |
| **Google / Kakao OAuth** | OAuth provider tokens | ✅ Yes — standard OAuth scope only |

**Verdict:** No third-party service receives unnecessary personal data.

### 5. Code-level data exposure

- **Route handlers:** No query parameters or paths contain user identifiers
  other than Prisma record IDs (cuid format, non-sequential).
- **Server Actions:** `saveRiskProfile`, `saveWatchlist` do not log input
  payloads.
- **Error handling:** `serverCapture.ts` and `finnhub.ts` catch errors and log
  only generic messages, not raw error objects containing payloads.
- **Environment variables:** All secrets consumed via `process.env.*` — never
  stringified, serialized, or logged.

### 6. Findings summary

| ID | Severity | Finding | Status |
|----|----------|---------|--------|
| SEC-004-01 | ✅ Pass | No broker account/order data stored | Compliant with CON-008 |
| SEC-004-02 | ✅ Pass | Personal data minimized to auth+product needs | Compliant with REQ-NF-024 |
| SEC-004-03 | ✅ Pass | No secrets in source code or logs | Compliant with REQ-NF-022 |
| SEC-004-04 | ✅ Pass | Third-party data sharing minimized | No action needed |
| SEC-004-05 | ✅ Pass | Code-level exposure reviewed | No findings |
| SEC-004-06 | ✅ Pass | Prisma schema: no EventLog/NotificationLog | Follows SRS v0.3 delegation |
