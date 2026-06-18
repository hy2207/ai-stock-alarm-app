# Issue #76 - ONB-Q02 Settings Watchlist Edit UI

## Summary

- Added settings watchlist edit state helper built on the existing 1-3 item selection rules.
- Added GWT coverage for unchanged, changed, empty, and over-limit settings edit states.
- Updated `SettingsPage` and `SettingsPageV2` to initialize from the existing watchlist, keep edit state synced, and disable save when unchanged or invalid.
- Reused the same selection toggle logic as onboarding so settings and onboarding enforce the same max-three behavior.

## Verification

- `pnpm test src/app/lib/__tests__/onboardingSelection.test.ts src/lib/dto/__tests__/saveWatchlist.test.ts src/lib/actions/__tests__/saveWatchlist.test.ts` - passed, 3 files / 29 tests.
- `env DATABASE_URL=file:./test.db pnpm prisma db push` - passed.
- `env DATABASE_URL=file:./test.db pnpm test` - passed, 34 files / 287 tests.
- `pnpm typecheck` - fails on existing baseline type errors outside this issue scope, including `StockAlarmBrand.tsx`, `HomePage.tsx`, `RecommendationDetailPage.tsx`, auth tests/options, Gemini provider usage, OneSignal typing, and ticker history test casting.
- `pnpm lint` - fails because `next lint` opens the initial ESLint configuration prompt.
- `pnpm build` - compiles successfully, then fails during type validation at the existing `StockAlarmBrand.tsx` `StaticImageData` vs `string` error.

## Scope Notes

- This change extends the existing ONB-Q01 PR branch rather than creating a new branch.
- No new API route was added.
- The current UI still uses app context/mock state; server-side persistence remains covered by the existing `saveWatchlist` Server Action path and tests.
- No chart or indicator UI was added.
