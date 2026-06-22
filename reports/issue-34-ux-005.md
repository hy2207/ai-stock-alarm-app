# Issue #34 UX-005 Report

## Scope

- Defined login CTA priority for the current Google and Kakao providers.
- Documented protected route fallback, safe `callbackUrl` with legacy `returnTo` compatibility, session expiration, refresh failure, re-login, and provider failure UX states.
- Added security copy rules that prohibit OAuth token, provider payload, user identifier, secret, and stack trace exposure.
- Mapped UX states to AUTH-Q01, AUTH-C02, and AUTH-C03.

## TDD Cycle

- Red: Added `src/lib/ux/__tests__/authSessionUx.test.ts`; targeted test failed because `docs/ux/UX-005-auth-session-ux.md` did not exist.
- Green: Added `docs/ux/UX-005-auth-session-ux.md`; targeted test passed with 5 tests covering login choices, protected route fallback, session states, sensitive information rules, and downstream task mapping.
- Refactor: Kept UX-005 as a document contract. No runtime auth, provider secret, API, Prisma schema, or environment changes were needed.

## Verification

- `npx vitest run src/lib/ux/__tests__/authSessionUx.test.ts` -> pass, 5 tests.
- `npm run typecheck` -> pass.
