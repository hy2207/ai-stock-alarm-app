# Issue #69 - TEST-F10-01 Auth Middleware GWT Tests

## Summary

- Reframed middleware behavior tests as Given/When/Then cases for the auth guard contract.
- Covered unauthenticated protected access redirecting to `/login` with `callbackUrl`.
- Covered valid session token pass-through for protected pages.
- Covered expired or refresh-failed session states redirecting away from protected content.
- Covered public route bypass so NextAuth token lookup is not called for `/login`.

## Verification

- `pnpm test src/__tests__/middleware.test.ts` - passed, 1 file / 16 tests.
- `pnpm test src/__tests__/middleware.test.ts src/lib/auth/__tests__/authOptions.test.ts src/lib/dto/__tests__/auth.test.ts` - passed, 3 files / 41 tests.
- `env DATABASE_URL=file:./test.db pnpm prisma db push` - passed.
- `env DATABASE_URL=file:./test.db pnpm test` - passed, 34 files / 294 tests.
- `pnpm typecheck` - fails on existing baseline type errors outside this issue scope, including `StockAlarmBrand.tsx`, `HomePage.tsx`, `RecommendationDetailPage.tsx`, auth tests/options, Gemini provider usage, OneSignal typing, and ticker history test casting.
- `pnpm lint` - fails because `next lint` opens the initial ESLint configuration prompt.
- `pnpm build` - compiles successfully, then fails during type validation at the existing `StockAlarmBrand.tsx` `StaticImageData` vs `string` error.

## Scope Notes

- This change extends the existing AUTH-C02 branch and PR rather than creating a new branch.
- No runtime middleware behavior changed.
- No user-facing product UI changed.
