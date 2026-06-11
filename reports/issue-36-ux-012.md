# Issue #36 UX-012 Report

## Scope

- Defined archive list field priority for ticker, predictedDirection, realizedReturn, hitFlag, evaluatedAt, holdDays, and reasonLine.
- Documented ticker filter, grouping, latest first sorting, status filters, success/failure outcomes, and 수익률 display rules.
- Defined archive empty states, settings entry points, existing watchlist settings IA, and navigation rules.
- Mapped downstream implementation tasks ARC-Q01, ARC-Q02, and ONB-Q02.

## TDD Cycle

- Red: Added `src/lib/ux/__tests__/archiveSettingsIa.test.ts`; targeted test failed because `docs/ux/UX-012-archive-settings-information-architecture.md` did not exist.
- Green: Added `docs/ux/UX-012-archive-settings-information-architecture.md`; targeted test passed with 5 tests covering field priority, filters/sorting, success/failure display, empty states, and downstream mapping.
- Refactor: Kept UX-012 as a document contract. No Prisma query, runtime UI, API, schema, or environment changes were needed.

## Verification

- `pnpm test src/lib/ux/__tests__/archiveSettingsIa.test.ts` -> pass, 5 tests.
- `pnpm typecheck` -> pass after local Prisma Client generation.
- `env DATABASE_URL=file:./test.db pnpm test` -> pass, 46 files / 455 tests.
- `pnpm lint` -> pass with existing warnings.
- `pnpm build` -> pass with existing warnings.
