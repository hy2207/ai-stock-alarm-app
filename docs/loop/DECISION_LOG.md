# Decision Log

> Created: 2026-05-28
> Description: Ultra-work loop decisions for ai-stock-alarm-app implementation.

## Decision Register

### CORE: 1

**Decision CORE-001**: INFRA-001 (#6) before DB-001 (#1) despite ISSUE_LIST.md ordering
- **Context**: ISSUE_LIST.md lists DB-001 (#1) before INFRA-001 (#6), both marked "Depends on: None". However, the dependency graph in `tasks/task-list-v1.md` (§의존성 그래프) shows INFRA-001 → DB-001 (Phase 0 → Phase 1). The current project is a Vite SPA and must be migrated to Next.js App Router per SRS C-TEC. Setting up Prisma (DB-001) in the Vite project would create rework when INFRA-001 migrates to Next.js.
- **Decision**: Process INFRA-001 first to establish the Next.js foundation, then DB-001 for Prisma within the Next.js project. This follows the technical dependency graph and avoids wasted work.
- **Classification**: CORE (affects execution order of multiple issues)

**Decision CORE-002**: Prisma v7 removed datasource `url` and array `provider`. Downgraded to Prisma v6.6.0.
- **Context**: npm installed Prisma 7.8.0 (latest). Prisma v7 requires `prisma.config.ts` and a driver adapter (`@prisma/adapter-libsql`) for SQLite, which changes the client constructor API from classic `new PrismaClient()`. The SRS and all task specs assume the classic Prisma approach (`url` in schema, standard `PrismaClient` constructor). Pin to 6.6.0 to match documented patterns.
- **Decision**: Pin `prisma@6.6.0` and `@prisma/client@6.6.0`. Revisit version upgrade when project maturity warrants the config migration effort.
- **Classification**: MINOR (tooling version, no user-facing impact)

### MINOR: 1

---

CORE: 2
MINOR: 1
