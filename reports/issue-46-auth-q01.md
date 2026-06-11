# Issue #46 AUTH-Q01 Report

## Scope

- Added an App Router `/login` page using existing shadcn/ui Button, Card, Input, and Label components.
- Rendered Google, Kakao, and email login choices without requiring provider API keys in code.
- Added safe internal `returnTo` handling for NextAuth callback URLs.
- Included privacy, legal disclaimer, and no broker order execution copy without exposing OAuth tokens, provider payloads, user identifiers, or secrets.

## TDD Cycle

- Red: Added `src/app/login/__tests__/page.test.tsx`; targeted test failed because `src/app/login/page.tsx` did not exist.
- Green: Added `src/app/login/page.tsx`; targeted test passed with 5 tests covering login choices, privacy/legal copy, safe returnTo handling, and callback URL rendering.
- Refactor: Moved safe returnTo handling into `src/app/login/utils.ts` because Next.js page files cannot export arbitrary helper fields. No provider secret, runtime auth config, Prisma schema, or environment changes were needed.

## Verification

- `pnpm test src/app/login/__tests__/page.test.tsx` -> pass, 5 tests.
- `pnpm typecheck` -> pass after local Prisma Client generation.
- `env DATABASE_URL=file:./test.db pnpm test` -> pass, 46 files / 455 tests.
- `pnpm lint` -> pass with existing warnings.
- `pnpm build` -> pass with existing warnings; `/login` route included.
