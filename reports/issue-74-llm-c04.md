# Issue #74 - LLM-C04 streamObject Card Generation

## Summary

- Added `generateRecommendationCards()` to call Vercel AI SDK `streamObject()` with the existing Decision Layer prompt builder.
- Added a structured generation schema for either:
  - `ok` with exactly three confidence variants: `aggressive`, `balanced`, `conservative`.
  - `no_call` with a concise reason.
- Added Zod validation for ticker, direction, entry/target price presence, hold horizon 1-10 days, confidence mode, and reason line length.
- Added No Call fallback for empty watchlists, invalid structured output, and stream/model errors so callers do not surface unnecessary 5xx failures.
- Updated Gemini provider access to the v6-compatible callable provider API and normalized legacy `models/` prefixes.

## Verification

- `pnpm test src/lib/llm/__tests__/generateRecommendationCards.test.ts src/lib/llm/__tests__/gemini.test.ts src/lib/llm/__tests__/promptBuilder.test.ts` - passed, 3 files / 16 tests.
- `env DATABASE_URL=file:./test.db pnpm prisma db push` - passed.
- `env DATABASE_URL=file:./test.db pnpm test` - passed, 35 files / 291 tests.
- `pnpm typecheck` - fails on existing baseline type errors outside this issue scope, including `StockAlarmBrand.tsx`, `HomePage.tsx`, `RecommendationDetailPage.tsx`, auth tests/options, OneSignal typing, and ticker history test casting.
- `pnpm lint` - fails because `next lint` opens the initial ESLint configuration prompt.
- `pnpm build` - compiles successfully, then fails during type validation at the existing `StockAlarmBrand.tsx` `StaticImageData` vs `string` error.

## Scope Notes

- This change extends the existing LLM-C03 PR branch rather than creating a new branch.
- No API key is required for tests because `streamObject()` is dependency-injected and mocked.
- No persistence logic was added; generated card storage remains for LLM-C07.
- No `/api/events` endpoint was added.
- No chart or indicator UI was added.
