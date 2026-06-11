# Issue #35 UX-006 Report

## Scope

- Defined onboarding watchlist selection flow for ticker/sector choices and continue/home CTA states.
- Documented selected, unselected, deselected, disabled, and invalid item states.
- Defined minimum 1 and maximum 3 selection limits with Korean copy.
- Documented settings edit flow for existing watchlist, save success, and save failure feedback.
- Mapped downstream implementation tasks ONB-Q01, ONB-Q02, ONB-C01, and ONB-C02.

## TDD Cycle

- Red: Added `src/lib/ux/__tests__/onboardingWatchlistUx.test.ts`; targeted test failed because `docs/ux/UX-006-onboarding-watchlist-settings-ux.md` did not exist.
- Green: Added `docs/ux/UX-006-onboarding-watchlist-settings-ux.md`; targeted test passed with 5 tests covering onboarding UI, item states, selection limits, settings edit flow, and downstream task mapping.
- Refactor: Kept UX-006 as a document contract. No Server Action, API, Prisma schema, or runtime UI changes were needed.

## Verification

- `pnpm test src/lib/ux/__tests__/onboardingWatchlistUx.test.ts` -> pass, 5 tests.
- `pnpm typecheck` -> pass after local Prisma Client generation.
- `env DATABASE_URL=file:./test.db pnpm test` -> pass, 46 files / 455 tests.
- `pnpm lint` -> pass with existing warnings.
- `pnpm build` -> pass with existing warnings.
