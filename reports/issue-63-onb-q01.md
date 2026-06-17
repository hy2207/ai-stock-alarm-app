# Issue #63 Report: ONB-Q01 Onboarding Selection UI

## Summary

Implemented test-covered onboarding selection behavior for ticker/sector selection.

The UI remains local-state based in the current app shell, but the selection rules and saveWatchlist payload mapping are now centralized and reusable by the later Server Action wiring.

## Changes

- Added `src/app/lib/onboardingSelection.ts`.
- Added reusable selection helpers:
  - `toggleOnboardingSelection`
  - `getOnboardingSelectionState`
  - `validateOnboardingSelection`
  - `buildWatchlistInput`
- Added tests for:
  - select/deselect behavior
  - maximum 3 selections
  - minimum 1 item validation
  - ticker vs sector payload mapping for `saveWatchlist`
  - unknown item rejection
- Updated `OnboardingPage` and `OnboardingPageV2` to use the shared selection state and validation helpers.

## Verification

Passed:

```bash
pnpm test src/app/lib/__tests__/onboardingSelection.test.ts
pnpm test src/app/lib/__tests__/onboardingSelection.test.ts src/lib/dto/__tests__/saveWatchlist.test.ts src/lib/actions/__tests__/saveWatchlist.test.ts
env DATABASE_URL=file:./test.db pnpm prisma db push
env DATABASE_URL=file:./test.db pnpm test
```

Results:

- Onboarding selection test: 1 file / 5 tests passed.
- Related onboarding/watchlist tests: 3 files / 25 tests passed.
- Full test suite with SQLite test DB: 34 files / 283 tests passed.

Known existing failures outside this issue scope:

```bash
pnpm typecheck
```

Fails on existing type errors unrelated to ONB-Q01, including:

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

- Supports onboarding data collection for Decision Layer recommendation cards.
- Keeps the selection model simple: 1-3 tickers/sectors only.
- Does not add chart, indicator, broker execution, or analytics sink scope.
- Does not require external API keys or account setup.
