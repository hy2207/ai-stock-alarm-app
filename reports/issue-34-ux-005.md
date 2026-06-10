# Issue #34 UX-005 Report

## Scope

- Defined login CTA priority for Google, Kakao, and email login.
- Documented protected route fallback, safe `returnTo`, session expiration, refresh failure, re-login, and provider failure UX states.
- Added security copy rules that prohibit OAuth token, provider payload, user identifier, secret, and stack trace exposure.
- Mapped UX states to AUTH-Q01, AUTH-C02, and AUTH-C03.

## TDD Cycle

- Red: Added `src/lib/ux/__tests__/authSessionUx.test.ts`; targeted test failed because `docs/ux/UX-005-auth-session-ux.md` did not exist.
- Green: Added `docs/ux/UX-005-auth-session-ux.md`; targeted test passed with 5 tests covering login choices, protected route fallback, session states, sensitive information rules, and downstream task mapping.
- Refactor: Kept UX-005 as a document contract. No runtime auth, provider secret, API, Prisma schema, or environment changes were needed.

## Verification

- `pnpm test src/lib/ux/__tests__/authSessionUx.test.ts` -> pass, 5 tests.
- `pnpm typecheck` -> pass after local Prisma Client generation.
- `env DATABASE_URL=file:./test.db pnpm test` -> pass, 46 files / 455 tests.
- `pnpm lint` -> pass with existing warnings.
- `pnpm build` -> pass with existing warnings.
