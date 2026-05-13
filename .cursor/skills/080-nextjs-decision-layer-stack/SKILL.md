---
name: 080-nextjs-decision-layer-stack
description: MUST read for Next.js App Router + Prisma + Vercel AI SDK + Gemini work on this repo. Summarizes SRS C-TEC and forbidden patterns.
---
# Next.js Decision Layer stack (project skill)

This duplicates the canonical playbook in **`.agents/skills/020-nextjs-prisma-vercel-stack/SKILL.md`** for Cursor discovery. Prefer reading that file if symlinked.

## Core
- **Next.js App Router**, **Prisma**, **Supabase Postgres** (prod) / **SQLite** (dev), **Tailwind + shadcn/ui**.
- **Vercel AI SDK** + **Gemini** via **`streamObject()`** for recommendation JSON; **`GEMINI_MODEL`** env.
- **NextAuth.js** + **middleware** for protected routes.

## Recommendation logic
- Persist **three** `confidenceScore` variants per generation when using the LLM batch approach (REQ-FUNC-082, REQ-FUNC-031).
- Zod-validate all card fields; invalid → retry LLM once then **No Call** + server events.

## Analytics / push
- **PostHog** only — no `/api/events`. See **`.agents/skills/030-posthog-onesignal-ops/SKILL.md`**.
- **OneSignal** + **Vercel Cron** with **`CRON_SECRET`**.

## UI law
- **ADR-004:** no candle/RSI/MACD widgets in the **main fold** of recommendation detail.
