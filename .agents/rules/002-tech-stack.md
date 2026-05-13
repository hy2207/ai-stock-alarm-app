---
description: Target stack per SRS C-TEC — Next.js, Prisma, Vercel AI SDK, Gemini, PostHog, OneSignal
globs: ["**/*.{ts,tsx,js,jsx,mjs,cjs}", "**/prisma/schema.prisma", "**/vercel.json", "**/package.json"]
alwaysApply: false
---
# Technical stack (SRS C-TEC)

**Migrate toward this stack** for new code. If the repo root still shows a legacy Vite SPA, treat Next.js paths below as the **target** layout (`AGENTS.md`).

## Application
- **Next.js App Router** — RSC, **Server Actions**, **Route Handlers** under `app/api/**/route.ts`.
- **TypeScript** + **Zod** at boundaries.

## Data
- **Prisma**; **SQLite** local, **PostgreSQL (Supabase)** prod; **`prisma migrate`**.
- Entities: User, RiskProfile, Watchlist, RecommendationCard, EvidenceSnapshot, PerformanceRecord. **No** Prisma EventLog / NotificationLog.

## UI
- **Tailwind CSS** + **shadcn/ui**.

## AI
- **Vercel AI SDK** + **`@ai-sdk/google`** (Gemini); default **`streamObject()`**.
- **`GEMINI_MODEL`** env; **three card variants** per batch (aggressive/balanced/conservative).

## Auth & security
- **NextAuth.js**; **middleware** for protected routes. Secrets in **Vercel env** only.

## Analytics & push
- **PostHog** (`posthog-js` + server helper). **No** **`/api/events`** endpoint.
- **OneSignal** + **Vercel Cron** + `CRON_SECRET` for morning briefing.

## External data
- **Yahoo Finance** / **Finnhub** with `fetch` cache/`unstable_cache`; `/api/admin/health` for freshness signals.

## Performance anchors
- REQ-NF-001–004: home p95 800ms, detail 700ms, risk UI 300ms, push landing 1s (see SRS).
