# Recommendation Generation Fix Log - 2026-06-22

## Scope

This log summarizes the work done to diagnose and fix the local recommendation generation failure after Google OAuth, watchlist selection, and Gemini environment setup were completed.

## Timeline Summary

### 1. Auth and Local App Startup

- Google OAuth login was configured and verified locally.
- `redirect_uri_mismatch` was resolved by aligning the Google OAuth redirect URI with the local callback URL.
- After restarting `localhost:3000`, login completed without OAuth errors.
- A follow-up issue was fixed where login succeeded but the app did not proceed to the main page.

### 2. Recommendation Generation UX

- Recommendation generation was changed from automatic execution to a manual `추천 생성하기` button.
- Client-side request timeout handling was added so the UI does not spin indefinitely.
- The dev generation API was updated to expose safer development-stage failure details instead of returning only a generic error.

### 3. Initial Failure

Observed user-facing error:

```text
추천 생성 실패: Recommendation generation is unavailable. Review the watchlist later.
```

At this point:

- Login worked.
- Watchlist selection worked.
- Local DB had a user and watchlist items.
- Recommendation cards were not being created.
- The app returned a generic No Call reason instead of the real failure cause.

### 4. Root Cause Analysis

The failure was not caused by a missing or invalid Gemini API key.

Verification:

- `.env` had `GEMINI_API_KEY` and `GEMINI_MODEL` set.
- Direct Gemini REST call succeeded.
- AI SDK call with the app's Gemini provider initialization succeeded in about 1 second.
- The configured `GEMINI_MODEL` was valid.

The actual bottleneck was the recommendation generation implementation:

- `generateRecommendationCards()` used `streamObject()` with a complex Zod discriminated union schema.
- The real recommendation prompt/schema path timed out after 25 seconds.
- The timeout was collapsed into the generic fallback message:

```text
Recommendation generation is unavailable. Review the watchlist later.
```

Finnhub candle requests also returned `403`, but that was not the blocker because Yahoo fallback successfully allowed market data collection.

### 5. Fix Implemented

Commit:

```text
416ad2f fix(rec): avoid gemini structured generation timeout
```

Changed files:

- `src/lib/llm/generateRecommendationCards.ts`
- `src/lib/llm/__tests__/generateRecommendationCards.test.ts`

Key changes:

- Replaced provider-side structured streaming generation with `generateText()`.
- Required Gemini to return plain JSON only.
- Parsed returned JSON server-side.
- Kept the existing Zod recommendation schema as the authoritative validation layer.
- Added Gemini provider options:
  - `thinkingLevel: "minimal"`
  - `includeThoughts: false`
- Added `temperature: 0.2` and `maxOutputTokens: 1200`.
- Preserved two-attempt validation behavior.
- Improved failure reasons for:
  - timeout
  - API key/model access
  - quota/rate limit
  - provider API errors
  - empty response
  - schema mismatch
- Added development-only sanitized logging for Gemini generation failures.

## Verification Results

Commands run:

```bash
npm run typecheck
npx vitest run src/lib/llm/__tests__/generateRecommendationCards.test.ts src/lib/recommendations/__tests__/generateRecommendationsForUser.test.ts src/app/api/dev/generate-recommendations/__tests__/route.test.ts
DATABASE_URL=file:./dev.db npm test
```

Results:

- Typecheck passed.
- Related recommendation tests passed.
- Full test suite passed:
  - 54 test files
  - 449 tests

Local runtime verification:

- `POST /api/dev/generate-recommendations` returned:

```json
{
  "generatedCount": 3,
  "skippedCount": 0,
  "validationErrors": [],
  "externalApiErrors": [
    "Finnhub candle (NVDA): Finnhub returned 403",
    "Finnhub candle (TSLA): Finnhub returned 403",
    "Finnhub candle (META): Finnhub returned 403"
  ]
}
```

- Local DB confirmed 3 `published` recommendation cards for today.
- `localhost:3000` dev server was left running.

## Current State

- Google login is working.
- Watchlist selection is working.
- Manual recommendation generation is working.
- Recommendation cards are being saved to DB.
- Finnhub candle API is returning `403`, but Yahoo fallback allows recommendation generation to proceed.
- Latest pushed `main` commit is:

```text
416ad2f fix(rec): avoid gemini structured generation timeout
```

## Known Remaining Issues

- Finnhub API currently returns `403` for candle requests.
- The local dev flow still depends on external Gemini and Yahoo availability.
- Recommendation output quality should be reviewed manually because the generation path now parses JSON text rather than relying on provider-side structured output.
- UI should be checked after DB generation to confirm the cards render correctly across risk modes.

## Next Steps

1. Verify the home page visually after generation.
   - Open `http://localhost:3000`.
   - Confirm today's 3 generated cards render.
   - Confirm risk mode toggle displays aggressive, balanced, and conservative variants correctly.

2. Review generated recommendation quality.
   - Check ticker relevance.
   - Check entry, target, stop, and hold day values.
   - Check reason lines are under 160 characters and do not expose chart/indicator-first analysis.

3. Decide what to do with Finnhub `403`.
   - Confirm whether the current Finnhub plan supports candle endpoints.
   - If not, keep Yahoo as primary for dev or update the market-data provider policy.
   - Document this in `docs/env-external-issue-runbook.md` if the issue is expected.

4. Add a small UI regression check for generation failure display.
   - Timeout should show a timeout-specific message.
   - Schema mismatch should show a schema-specific message.
   - Generic fallback should only appear for unknown failures.

5. Consider adding a provider fallback policy test.
   - Finnhub candle failure + Yahoo success should still generate cards.
   - Finnhub missing in dev should still allow Yahoo-only generation.
   - Production behavior should remain explicit and conservative.

6. Before deployment, verify production env variables.
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
   - `DATABASE_URL`
   - Market-data keys according to the chosen provider policy
