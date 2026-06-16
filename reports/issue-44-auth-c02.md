# Issue #44 Report: AUTH-C02 Auth Middleware Guard

## Summary

Implemented a Next.js middleware auth guard for protected recommendation-service pages.

## Changes

- Added `src/middleware.ts`.
- Added protected route detection for:
  - `/app`
  - `/onboarding`
  - `/archive`
  - `/settings`
  - `/recommendations/*`
  - `/state/*`
- Left public routes unguarded:
  - `/`
  - `/login`
  - `/api/auth/*`
  - Next.js static/image assets
  - public file requests such as `/favicon.ico`
- Redirects unauthenticated protected requests to `/login`.
- Preserves the original path and query string in `callbackUrl`.
- Treats a token with `sub` and no `error` field as authenticated.
- Added middleware unit tests covering public paths, protected paths, redirect behavior, authenticated pass-through, and public-route token bypass.

## Verification

Passed:

```bash
pnpm test src/__tests__/middleware.test.ts
pnpm test src/__tests__/middleware.test.ts src/lib/auth/__tests__/authOptions.test.ts src/lib/dto/__tests__/auth.test.ts
env DATABASE_URL=file:./test.db pnpm prisma db push
env DATABASE_URL=file:./test.db pnpm test
```

Results:

- Target middleware test: 15 passed.
- Auth-related tests: 38 passed.
- Full test suite with SQLite test DB: 34 files / 293 tests passed.

Known pre-existing failures outside this issue scope:

```bash
pnpm typecheck
```

Fails on existing type errors unrelated to AUTH-C02, including:

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

Fails at the same existing typecheck stage, first reported at `src/app/components/StockAlarmBrand.tsx`.

## Product/Architecture Notes

- No `/api/events` endpoint was added.
- No broker execution behavior was added.
- No chart or indicator UI was added.
- The change is limited to authentication access control.
