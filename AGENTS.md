# AGENTS.md — Cross-tool global rules

**Supported by:** Cursor, Claude Code, Google Antigravity / Gemini CLI (when configured to read this file).

**Authoritative product & engineering specs (read before major work):**

- `docs/PRD_v1.md` — product vision, ADR-001~005, KPIs, user stories, scope, experiments.
- `docs/SRS-v1.md` — functional/non-functional requirements (REQ-FUNC-xxx, REQ-NF-xxx), APIs, Prisma model outline, integrations.

If implementation details conflict, **PRD → SRS → this file → code**. If `package.json` still reflects a legacy scaffold (e.g. Vite SPA), **new work and migrations follow SRS C-TEC** unless explicitly told otherwise.

---

## 1. Product in one paragraph

**US stock risk-adaptive decision interface (Decision Layer, not a news app):** compress today’s watchlist into **1–3 recommendation cards** with direction, executable price/range, **1–10 day** hold horizon, **user-selected confidence / risk mode** (aggressive / balanced / conservative), a **≤160 character reason line**, and **trust layer** performance history including failures. **No candle/RSI/MACD in the main fold** (ADR-004). **No broker order execution** in v1 (ADR scope). North-star KPI: **NS-01 ADR** (see PRD §1.2).

---

## 2. Architecture & ADRs (non-negotiable)

| ADR | Rule |
|-----|------|
| ADR-001 | Core output is **actionable decision cards**, not generic information dumps. |
| ADR-002 | **Confidence is interactive UX** (three modes); never reduce to a passive badge only. |
| ADR-003 | Horizon **3–5 business days** culture; no tick-scalping features in v1. |
| ADR-004 | **Charts/indicators excluded** from primary detail fold; result-first UI. |
| ADR-005 | **Trust layer**: show prediction history with **failures** when data exists. |

**Feature gate (PRD §1.6):** reject or defer changes that fail ≥2 of the five questions (Decision Layer, risk choice, horizon fit, de-complexing, trust-by-data).

---

## 3. Target technical stack (SRS C-TEC)

Implement and migrate toward:

- **Runtime:** **Next.js (App Router)** single full-stack app — RSC, **Server Actions**, **Route Handlers** (`app/api/**/route.ts`). No separate Java/Python API server for MVP.
- **DB:** **Prisma** — local **SQLite**, production **PostgreSQL (Supabase)**; migrations via `prisma migrate`.
- **UI:** **Tailwind CSS** + **shadcn/ui** (copy-in components).
- **LLM:** **Vercel AI SDK** + **Google Gemini** (`@ai-sdk/google`), default **`streamObject()`** for structured cards; **`GEMINI_MODEL`** env for model swaps. **Three card variants per run** (aggressive/balanced/conservative) so UI toggles without extra LLM calls (REQ-FUNC-031).
- **Auth:** **NextAuth.js** (`/api/auth/[...nextauth]`), **middleware** for protected routes.
- **Analytics:** **PostHog** (`posthog-js` client + server capture helper). **Do not** add PRD-forbidden **`/api/events`**; events listed in SRS REQ-FUNC-060.
- **Push:** **OneSignal** (REST + Web SDK), **Vercel Cron** for morning briefing (`CRON_SECRET` on cron requests).
- **Market data:** **Yahoo Finance** and/or **Finnhub** via `fetch` + `revalidate` / `unstable_cache` as in SRS.
- **Deploy:** **Vercel** (git push deploy); secrets in **Vercel env** only — never commit secrets or log them.

---

## 4. Coding & change discipline

- **Minimal diffs:** solve the asked task; no drive-by refactors or unrelated files.
- **Match existing style:** imports, naming, patterns in the touched area.
- **Type safety:** Zod (or equivalent) at boundaries for LLM output, Server Actions, and route bodies.
- **Observability:** emit the SRS event names with stable properties for PostHog dashboards.
- **Legal copy:** keep disclaimer strings required by REQ-FUNC-085 on card surfaces.
- **Documentation:** do not create new `*.md` files unless the user asked for docs; update `docs/` when product contracts change.

---

## 5. Harness layout (this repo)

| Layer | Path | Role |
|-------|------|------|
| Global rules (this file) | `AGENTS.md` | Product + stack + ADR alignment for all tools |
| Claude Code session context | `CLAUDE.md` | Claude-specific routing + agent/command index |
| Cursor rules | `.cursor/rules/*.mdc` | Always-on + glob-scoped editor rules |
| Antigravity rules | `.agents/rules/*.md` | Mirror of Cursor rules where possible |
| Shared skills | `.cursor/skills/*/SKILL.md` | On-demand playbooks. **This repo:** `.agents/skills` → symlink to `../.cursor/skills` (one physical tree). |
| Cursor discovery | `.cursor/skills/` | Same tree — includes SRS task generation, PRD gates, PostHog ops. |
| Cursor / Claude / Gemini subagents | `.cursor/agents/`, `.claude/agents/`, `.gemini/agents/` | Tool-specific isolation & tooling metadata |
| Antigravity workflows | `.agents/workflows/*.md` | Manual `/workflow` style macros |

**Symlink note:** `.agents/skills` → `../.cursor/skills` so Antigravity/Gemini CLI paths resolve to the same files Cursor uses.

---

## 6. Key file & API map (SRS appendix)

- Recommendations: `GET /api/recommendations/today`, `GET /api/recommendations/[recId]` (or RSC direct Prisma where appropriate).
- Server Actions: `saveRiskProfile`, `saveWatchlist` (Zod-validated).
- Cron: `GET /api/cron/morning-briefing` (auth via `CRON_SECRET`).
- Health: `GET /api/admin/health` (data freshness).
- Prisma core entities: User, RiskProfile, Watchlist, RecommendationCard, EvidenceSnapshot, PerformanceRecord — **not** EventLog/NotificationLog in DB (delegated to PostHog / OneSignal per SRS v0.3).

---

## 7. Reference READMEs (tool operator guides)

- `README-common-harness.md` — shared `AGENTS.md` / skills strategy.
- `README-cursor-harness.md` — Rules, Skills, Agents, Hooks.
- `README-claude-harness.md` — `CLAUDE.md`, `.claude/agents`, skills, plugins.
- `README-gemini-harness.md` — `.agents/*`, `.gemini/agents`, workflows.
