# Issue #61 Report: LLM-C03 Prompt Builder

## Summary

Implemented a deterministic LLM prompt builder for recommendation card generation.

This issue does not call Gemini or require API keys. It prepares the `system` and `user` prompts consumed by the later `streamObject()` execution step.

## Changes

- Added `src/lib/llm/promptBuilder.ts`.
- Added `buildRecommendationPrompt(input)`.
- Added prompt input types for:
  - selected `riskMode`
  - watchlist items
  - OHLCV market summaries
  - news signals
- Added strict prompt instructions for:
  - exactly 3 variants: `aggressive`, `balanced`, `conservative`
  - structured JSON with `status`, `variants`, and `confidenceMode`
  - 1-10 day `holdDays`
  - 3-5 business day default culture
  - `reasonLine` <= 160 characters
  - `no_call` when evidence is insufficient
  - no candle, RSI, or MACD wording in user-facing output
  - bilingual legal disclaimer: "투자 참고용 정보이며 투자 자문이 아님" / "not investment advice"
- Added unit tests for the prompt contract and missing-data behavior.

## Verification

Passed:

```bash
pnpm test src/lib/llm/__tests__/promptBuilder.test.ts
env DATABASE_URL=file:./test.db pnpm prisma db push
env DATABASE_URL=file:./test.db pnpm test
```

Results:

- Prompt builder test: 1 file / 6 tests passed.
- Full test suite with SQLite test DB: 34 files / 284 tests passed.

Known existing failures outside this issue scope:

```bash
pnpm typecheck
```

Fails on existing type errors unrelated to this prompt builder, including:

- `src/app/components/StockAlarmBrand.tsx` static image type mismatch.
- Existing authOptions test casts.
- Existing `src/lib/llm/gemini.ts` provider API typing.
- Existing `src/lib/push/onesignal.ts` possible undefined global.

```bash
pnpm lint
```

Fails because `next lint` opens the initial interactive ESLint configuration prompt.

```bash
pnpm build
```

Compiles successfully, then fails at the existing typecheck stage, first reported at `src/app/components/StockAlarmBrand.tsx`.

## Product Gate Notes

- Strengthens Decision Layer output by constraining LLM prompts toward actionable cards.
- Preserves the 3 confidence modes: `aggressive`, `balanced`, `conservative`.
- Keeps horizon within 1-10 days and states the 3-5 business day product culture.
- Explicitly excludes candle, RSI, and MACD wording from the user-facing output.
- Uses No Call when data is insufficient instead of forcing weak recommendations.
- Does not add `/api/events`.
