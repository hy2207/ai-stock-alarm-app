# Issue #68 Report: TEST-F1-01 saveWatchlist GWT Tests

## Summary

Added focused GWT-style coverage for `saveWatchlist` watchlist validation and persistence boundaries.

## Changes

- Added DTO validation coverage for:
  - ticker and sector both `null`
  - GWT parse case for null ticker/sector input
- Added Server Action coverage for:
  - invalid null ticker/sector input returns validation error
  - invalid input does not call Prisma write methods
  - invalid input does not call `revalidatePath`
  - single sector item is persisted with `priority: 1`

## Verification

Passed:

```bash
pnpm test src/lib/dto/__tests__/saveWatchlist.test.ts src/lib/actions/__tests__/saveWatchlist.test.ts
env DATABASE_URL=file:./test.db pnpm prisma db push
env DATABASE_URL=file:./test.db pnpm test
```

Results:

- Target saveWatchlist tests: 2 files / 24 tests passed.
- Full test suite with SQLite test DB: 33 files / 282 tests passed.

Known existing failures outside this issue scope:

```bash
pnpm typecheck
```

Fails on existing type errors unrelated to TEST-F1-01, including:

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

## Product/Architecture Notes

- No UI behavior, external API call, or secret-dependent setup was added.
- The tests keep onboarding watchlist constraints aligned with the 1-3 item Decision Layer context.
- No `/api/events` endpoint was added.
