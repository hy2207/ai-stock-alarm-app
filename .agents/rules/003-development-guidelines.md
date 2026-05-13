---
description: Implementation habits — minimal diffs, Zod, events, no chart creep
globs: ["**/*.{ts,tsx,js,jsx}"]
alwaysApply: false
---
# Development guidelines (Decision Layer app)

## Scope of change
- Touch only files needed for the task; no unrelated refactors in the same change unless requested.
- Match existing naming, structure, and imports.

## Domain rules in code
- **Cards:** validate ticker, direction, confidence, prices/ranges, `holdDays` 1–10, `reasonLine` 1–160 before publish.
- **Risk mode:** Zod on Server Actions; bad input → structured error, no silent overwrite (REQ-FUNC-033).
- **Charts:** no raw chart widgets in primary recommendation surfaces (ADR-004).
- **Disclaimers:** legal microcopy on card surfaces (REQ-FUNC-085).

## Analytics
- PostHog only, per SRS event taxonomy; never add **`/api/events`**.

## Data & migrations
- Prisma changes → migrations + regenerated client; SQLite/Postgres compatible schema.

## Quality bar
- Explicit types; loading / empty / **No Call** states; regression tests for REQ-critical paths when fixing bugs.

## Git
- Small commits; Conventional Commits when repo convention applies.
