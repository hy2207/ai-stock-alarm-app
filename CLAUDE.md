# CLAUDE.md — Claude Code project context

Loaded automatically for **Claude Code** sessions. **Global rules:** see `AGENTS.md` (product, ADRs, SRS stack). **Specs:** `docs/PRD_v1.md`, `docs/SRS-v1.md`.

---

## 1. What you are building

A **Decision Layer** web product for US equities: **1–3 recommendation cards**, risk mode, executable numbers, trust history, **no primary-fold charts**, analytics on **PostHog**, push via **OneSignal**, stack per **SRS C-TEC** (Next.js + Prisma + Vercel AI SDK + Gemini + NextAuth).

---

## 2. When to read which doc

| Situation | Open |
|-----------|------|
| Product scope, KPIs, experiments | `docs/PRD_v1.md` |
| REQ IDs, APIs, sequences, Prisma outline, PostHog event list | `docs/SRS-v1.md` |
| PRD feature gate / ADR conflicts | PRD §1.6, §7.6, §10 |
| Task/issue breakdown style | `.cursor/skills/generate-tasks-from-srs/SKILL.md` |

---

## 3. Subagents (`.claude/agents/`)

Use the **narrowest** agent that fits; prefer main session for small edits.

| Agent file | Use when |
|------------|----------|
| `nextjs-decision-layer.md` | App Router pages/layouts, RSC data load, middleware, routing |
| `prisma-data-layer.md` | Schema, migrations, queries, SQLite/Supabase compatibility |
| `vercel-ai-gemini-cards.md` | `streamObject`, card JSON schema, Zod validation, retries, No Call |
| `posthog-oneSignal-analytics.md` | Event taxonomy, capture helpers, cron/push flows |
| `shadcn-ui-ux.md` | Tailwind + shadcn components, confidence UI, card layout, a11y |
| `document-updater.md` | Sync README / `docs/` / harness rules before commits when needed |

**Removed from this repo (wrong stack):** Java/Spring, Gradle, JPA/QueryDSL, Redis/Kafka, Flutter agents — do not recreate unless the stack changes.

---

## 4. Commands (`.claude/commands/`)

| Command | Purpose |
|---------|---------|
| `/fix-error` | Seven-step structured diagnosis and fix |
| `/setup-env` | Node/pnpm, Prisma, Vercel env vars, `.env.example` alignment |
| `/gitflow-commit` | Conventional commit + PR-oriented summary |

**Skills:** physical files live in **`.cursor/skills/`** (`.agents/skills` symlinks here in this repo). To use the same tree from Claude Code only, keep the symlink or add `ln -sfn ../.cursor/skills .claude/skills` per `README-common-harness.md`.

---

## 5. Operating principles

1. **ADR compliance** — especially chart exclusion, trust layer, three risk modes, no `/api/events`.
2. **Serverless limits** — Vercel timeouts; prefer streaming for LLM paths (SRS REQ-NF-070).
3. **Secrets** — Vercel environment variables only; never print API keys.
4. **Minimal scope** — one concern per change; tests when touching REQ-critical paths.

---

## 6. Cross-tool parity

Cursor loads `.cursor/rules` and `.cursor/skills`. Antigravity loads `.agents/rules` and `.agents/skills`. Keep **product and stack rules** in sync with `AGENTS.md` updates.
