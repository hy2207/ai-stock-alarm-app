# Issue #87 - LLM-C06 Failure Handling

## Summary

- Added LLM call failure classification for API errors, rate limits, timeouts, and generic generation failures.
- Added `llm_call_failed` server event capture for non-validation `streamObject()` and model failures.
- Preserved the existing No Call user-facing fallback so provider errors do not surface as 5xx UI failures.
- Kept validation retry behavior separate: final structured-output validation failures emit `rec_validation_failed`, not `llm_call_failed`.

## Verification

- `pnpm test src/lib/llm/__tests__/generateRecommendationCards.test.ts src/lib/analytics/__tests__/serverCapture.test.ts` - passed, 2 files / 19 tests.
- `env DATABASE_URL=file:./test.db pnpm prisma db push` - passed.
- `env DATABASE_URL=file:./test.db pnpm test` - passed, 35 files / 297 tests.
- `pnpm typecheck` - fails on existing baseline type errors outside this issue scope, including `StockAlarmBrand.tsx`, `HomePage.tsx`, `RecommendationDetailPage.tsx`, auth tests/options, OneSignal typing, and ticker history test casting.
- `pnpm lint` - fails because `next lint` opens the initial ESLint configuration prompt.
- `pnpm build` - compiles successfully, then fails during type validation at the existing `StockAlarmBrand.tsx` `StaticImageData` vs `string` error.

## Scope Notes

- This change extends the existing LLM PR branch rather than creating a new branch.
- Tests mock `streamObject()` and `captureServerEvent()`, so no Gemini or PostHog API key is required.
- No persistence logic was added; generated card storage remains for LLM-C07.
- No `/api/events` endpoint was added.
