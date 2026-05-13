# AI Harness Rebaseline Plan

**Date:** 2026-05-12  
**Scope:** Align Cursor / Antigravity / Claude Code / Gemini harness with `docs/PRD_v1.md` and `docs/SRS-v1.md` (Decision Layer product, Next.js full stack per SRS C-TEC).

---

## 1. Objectives

- Single **product + engineering** source of truth: PRD → SRS → `AGENTS.md`.
- Remove template stack noise (Spring, Kafka, Flutter, etc.) from rules, skills, and subagents.
- Document **symlink layout**: `.agents/skills` → `../.cursor/skills` (one physical skill tree).

---

## 2. Delivered Changes (summary)

| Area | Path | Action |
|------|------|--------|
| Global rules | `AGENTS.md` | Rewritten: ADRs, C-TEC, PostHog/OneSignal, no `/api/events`, harness map |
| Claude context | `CLAUDE.md` | Rewritten: subagent index, commands, skill symlink note |
| Cursor rules | `.cursor/rules/001–003.mdc` | PRD/SRS-aligned overview, stack, dev guidelines |
| Antigravity rules | `.agents/rules/001–003.md` | Mirrored policy (Markdown + `globs` arrays) |
| Skills | `.cursor/skills/` | Added `010`, `020`, `030`, `080`; removed 12 legacy stacks; updated `generate-tasks-from-srs` |
| Claude agents | `.claude/agents/*.md` | Six agents: Next.js, Prisma, Vercel AI+Gemini, PostHog+OneSignal, shadcn UI, document-updater |
| Cursor agents | `.cursor/agents/*.md` | Added four short agents + document-updater heuristic fix |
| Gemini agents | `.gemini/agents/*.md` | `nextjs-stack-engineer`, `decision-layer-product-qa` |
| Claude commands | `.claude/commands/setup-env.md` | Next/pnpm/Prisma/Vercel env focus |
| Workflows | `.agents/workflows/generate-tasks-from-srs.md` | SRS path `docs/SRS-v1.md`, Next.js task decomposition |

---

## 3. Follow-up (optional)

- [ ] Migrate root `package.json` from Vite SPA to **Next.js App Router** per SRS; then tune `002-tech-stack.mdc` globs if paths differ.
- [ ] Add `ln -sfn ../.cursor/skills .claude/skills` on machines using Claude Code if skills should load there.
- [ ] Keep `docs/PRD_v1.md` / `docs/SRS-v1.md` in sync when REQ IDs or APIs change; run `document-updater` agent before release commits.

---

## 4. References

- `README-common-harness.md`, `README-cursor-harness.md`, `README-claude-harness.md`, `README-gemini-harness.md`
- `docs/PRD_v1.md`, `docs/SRS-v1.md`
