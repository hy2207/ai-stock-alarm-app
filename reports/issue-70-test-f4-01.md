# Issue #70 - TEST-F4-01 saveRiskProfile GWT tests

## Summary

- Added GWT coverage for invalid `riskMode` submissions so failed validation skips Prisma writes and route revalidation.
- Added parameterized GWT coverage for `aggressive`, `balanced`, and `conservative` to verify exact `riskProfile.upsert` payloads.
- Added DTO schema coverage for `null` and empty-string risk mode inputs.

## Verification

- `pnpm test src/lib/actions/__tests__/saveRiskProfile.test.ts src/lib/dto/__tests__/saveRiskProfile.test.ts` - passed, 2 files / 19 tests.
- `env DATABASE_URL=file:./test.db pnpm prisma db push` - passed.
- `env DATABASE_URL=file:./test.db pnpm test` - passed, 33 files / 284 tests.
- `pnpm typecheck` - fails on existing baseline type errors outside this issue scope, including `StockAlarmBrand.tsx`, `HomePage.tsx`, `RecommendationDetailPage.tsx`, auth tests/options, Gemini provider usage, OneSignal typing, and ticker history test casting.
- `pnpm lint` - fails because `next lint` opens the initial ESLint configuration prompt.
- `pnpm build` - compiles successfully, then fails during type validation at the existing `StockAlarmBrand.tsx` `StaticImageData` vs `string` error.

## Scope Notes

- This issue is test-only and does not change `saveRiskProfile` runtime behavior.
- No product-surface changes were made.
