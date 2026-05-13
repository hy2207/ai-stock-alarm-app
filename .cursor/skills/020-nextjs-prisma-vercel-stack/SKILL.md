---
name: 020-nextjs-prisma-vercel-stack
description: Next.js App Router, Prisma (SQLite/Supabase), Vercel deploy/cron, Server Actions vs Route Handlers — patterns aligned with SRS C-TEC.
---
# Next.js + Prisma + Vercel (SRS stack)

## Layout conventions
- **`app/`** routes: default to **RSC**; add `'use client'` only where browser state or PostHog browser APIs require it.
- **Mutations:** prefer **Server Actions** with Zod-validated payloads (`saveWatchlist`, `saveRiskProfile`).
- **HTTP APIs:** `app/api/.../route.ts` for cron, webhooks, JSON GET endpoints (recommendations, health).
- **Auth:** `middleware.ts` guards protected paths; session from NextAuth.

## Prisma
- Single schema compatible with **SQLite** and **PostgreSQL** (avoid DB-specific types that break SQLite).
- Migrations: `prisma migrate dev` locally; ship SQL for Supabase.
- Connection pooling on Vercel: prefer **Supabase pooler** or **Accelerate** per REQ-NF-072.

## Caching market data
- Wrap Finnhub/Yahoo calls with `fetch(..., { next: { revalidate: N }})` or `unstable_cache` with explicit keys; log staleness for `/api/admin/health`.

## Vercel limits
- Respect function timeout (Hobby 10s); LLM routes should **stream** (`streamObject`) so the first bytes arrive early (REQ-NF-070).
- Cron routes must verify **`CRON_SECRET`** header or query token.

## Forbidden shortcuts (SRS)
- No separate Express/Java/Python backend for MVP domain logic.
- No **`/api/events`** analytics sink — use PostHog SDKs/helpers only.
