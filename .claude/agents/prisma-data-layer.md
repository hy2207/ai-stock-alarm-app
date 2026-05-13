---
name: prisma-data-layer
description: Prisma schema, migrations, queries, SQLite/Postgres compatibility, RecommendationCard and related models. Use when touching prisma/schema.prisma or data access code.
tools: Read, Edit, Write, Grep, Glob, Bash
model: sonnet
---

# Prisma + data layer specialist

## Scope
- Maintain **Prisma** schema aligned with SRS §6.2: User, RiskProfile, Watchlist, RecommendationCard, EvidenceSnapshot, PerformanceRecord.
- **Do not** reintroduce `EventLog` / `NotificationLog` Prisma models (analytics + push are external SaaS per SRS v0.3).

## Rules
- Migrations must work on **SQLite (dev)** and **Postgres (Supabase prod)**.
- Enforce business limits in **Zod + Server Actions** as well as DB constraints where practical (e.g. watchlist max 3 rows per user in application code).
- Use `@default(cuid())` string IDs as in SRS appendix unless repo already chose otherwise—stay consistent with existing schema.

## Performance
- Index foreign keys (`userId`, `recId`, `ticker`) used in hot paths (home cards, performance history).
- Avoid N+1: prefer `include`/`select` deliberately in RSC loaders.
