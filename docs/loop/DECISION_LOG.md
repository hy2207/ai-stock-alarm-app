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

**Decision CORE-003**: Session 3 completed 5 issues (AUTH-C02, TEST-F10-01, LLM-Q01, TEST-F9-03, TEST-F2-01) but remaining 30+ unaddressed issues require visual-engineering, ops/config, or depend on other PR branches not yet merged to feat/47.
- **Context**: All code-level backend issues addressable from feat/47 are either implemented, on other PR branches, or already covered by existing tests. Remaining issues are visual-engineering (UI components, UX design), ops/config (monitoring, perf, deploy), writing (docs, taxonomy), or on separate PR branches (feat/36, feat/42, feat/43, feat/45). No unblocked code-level issues remain.
- **Classification**: MINOR (project status observation, not architecture/security/external dependency/data model/ADR)

### MINOR: 5

**Decision MINOR-002**: DTO-009 uses per-event Zod property schemas instead of a single loose `Record<string, unknown>`.
- **Context**: SRS REQ-FUNC-060 requires strict event property typing. Options: (a) one schema per event name with z.discriminatedUnion, (b) a factory function, (c) a single loose record type. Option (a) wins for type safety, auto-complete, and runtime validation. Each event name gets a dedicated schema keyed on the `event` literal.
- **Classification**: MINOR (analytics implementation detail)

**Decision MINOR-003**: EVT-C01 uses Next.js `use client` component without Suspense wrapping for PostHogProvider.
- **Context**: PostHog v3's `posthog-js` needs a browser `window` at init. We create the provider as a separate client component mounted inside `layout.tsx`. No Suspense boundary needed because the PostHog SDK internally handles async loading. The provider wraps `PostHogProvider` from `posthog-js/react`.
- **Classification**: MINOR (component wiring — standard PostHog Next.js pattern)

**Decision MINOR-004**: MOCK-004 adds rate-limit, timeout, and error fixtures alongside a validation test file.
- **Context**: Mock market data needs to simulate non-happy paths for reliable test coverage. Pattern: export `mockRateLimitedResponse`, `mockTimeoutResponse`, `mockErrorResponse` from each provider's mock. A shared `market.test.ts` validates the types against the real provider interfaces.
- **Classification**: MINOR (test infrastructure)

**Decision MINOR-005**: SEC-004 produces a standalone data minimization review document rather than inline assertions.
- **Context**: A security review document is the SRS-prescribed deliverable for REQ-NF-024/026 verification. It lives at `docs/security/data-minimization-review.md` — separate from code, independently auditable.
- **Classification**: MINOR (documentation deliverable)

**Decision MINOR-006**: EVT-C03 client event tracking hook — typed per-event capture functions.
- **Context**: Issue #113 requires 16 typed client event capture functions for PostHog. Implemented as a pure factory (`createClientEventCapturers`) wrapped by a React hook (`useClientEvent`), separating testable logic from the `usePostHog` context dependency. 17 unit tests pass.
- **Classification**: MINOR (analytics implementation detail, follows DTO-009 schema)

---

CORE: 2
MINOR: 7
STOP REASON: NO_UNBLOCKED_ISSUES
