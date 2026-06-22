# Remaining Branch Merge Plan - 2026-06-22

## Current Baseline

- Base branch: `main`
- Base commit at analysis time: `b38e87a fix(test): preserve finnhub status literals`
- Already merged in previous pass:
  - `origin/feat/30-dto-010-price-validation`
  - `origin/feat/31-dto-006-rec-detail-dto`
  - `origin/feat/32-dto-004-llm-output-schema`
  - `origin/feat/33-llm-c02-market-data`
  - `origin/feat/44-dto-006-rec-detail`
- Verification already passing on base:
  - `npm run typecheck`
  - `npx vitest run src/lib/dto/__tests__/llmOutput.test.ts src/lib/dto/__tests__/recommendationCard.test.ts src/lib/market-data/__tests__/finnhub.test.ts src/lib/market-data/__tests__/yahooFinance.test.ts`

## Priority Summary

| Priority | Branch | Why | Merge Strategy |
|---|---|---|---|
| P0 | `origin/feat/34-auth-c02-middleware-auth` | Smallest conflict surface, auth protection is core SRS stack work. Current `main` already has middleware, so this is likely superseded or needs selective test/code comparison. | Do not blind merge. Compare two files, cherry-pick only missing behavior/tests. |
| P1 | `origin/feat/44-auth-c02-middleware` | Same product area as P0 but includes middleware GWT tests. It overlaps larger stale LLM/admin/cron work, so resolve after P0 decision. | Extract only middleware/auth delta; avoid reintroducing stale shared files. |
| P2 | `origin/feat/89-llm-q01-gemini-model-swap` | High-value low product risk: validates `GEMINI_MODEL` env swap, aligned with SRS C-TEC. Current `main` already supports model env, so likely test-only or minor test hardening. | Cherry-pick or manually port only Gemini test delta. |
| P3 | `origin/feat/101-test-f9-03-retry-integration` | Adds LLM retry integration coverage, but branch also carries old LLM pipeline/admin/cron/action files already diverged from `main`. | Rebase conceptually onto current LLM modules; port tests one slice at a time. |
| P4 | `origin/feat/103-test-f2-01-card-query-test` | Adds card query GWT tests. Useful, but conflicts with stale query/admin/cron/action history. | Port query tests only after P3 LLM conflicts are understood. |
| P5 | `origin/feat/38-push-c02-morning-briefing-cron` | Broadest functional branch: push cron, login UI, onboarding update, multiple UX docs. Highest blast radius and multiple merge bases. | Split into sub-branches by feature before merging. |
| P6 | `origin/feat/16-ux-002-user-journey-ia` | Mostly UX documentation plus stale shared app/package changes. Lower runtime urgency. | Port doc artifact only; skip stale package/runtime changes unless explicitly needed. |
| P7 | `origin/feat/33-ux-004-responsive-accessibility` | UX documentation with same stale shared conflict set as P6. | Port doc artifact only after P6. |
| P8 | `origin/feat/34-ux-005-auth-session-ux` | UX auth-session documentation with same stale shared conflict set. | Port doc artifact only after auth middleware decision. |

## Branch Details and Required Steps

### P0 - `origin/feat/34-auth-c02-middleware-auth`

Conflict files:
- `src/__tests__/middleware.test.ts`
- `src/middleware.ts`

Current finding:
- `main` already has `src/middleware.ts` and `src/__tests__/middleware.test.ts`.
- This branch appears to be an older or alternate AUTH-C02 implementation rather than a clean additive change.

Steps:
1. Compare current `main` against branch files:
   - `git diff HEAD..origin/feat/34-auth-c02-middleware-auth -- src/middleware.ts src/__tests__/middleware.test.ts`
2. Identify behavior missing from `main`, if any:
   - protected route list
   - public route exemptions
   - `callbackUrl` preservation
   - token error handling
   - matcher behavior
3. If no behavior is missing, close or delete the branch as superseded.
4. If tests are stronger on the branch, manually port only the missing test cases.
5. Run:
   - `npm run typecheck`
   - `npx vitest run src/__tests__/middleware.test.ts`
6. Commit with:
   - `test(auth): reconcile middleware branch coverage`

### P1 - `origin/feat/44-auth-c02-middleware`

Conflict files:
- `src/__tests__/middleware.test.ts`
- `src/middleware.ts`
- stale shared files: admin health, morning briefing cron, `src/app/page.tsx`, action tests, LLM prompt files

Current finding:
- This branch includes AUTH-C02 plus older shared work that now conflicts with `main`.
- Treat it as a source branch for missing middleware tests, not as a direct merge candidate.

Steps:
1. Complete P0 first.
2. Inspect only auth-specific changes:
   - `git diff HEAD..origin/feat/44-auth-c02-middleware -- src/middleware.ts src/__tests__/middleware.test.ts src/lib/auth/authOptions.ts`
3. Ignore conflicts in admin health, cron, action tests, and LLM files unless a clear auth dependency exists.
4. Port any missing GWT cases into current `src/__tests__/middleware.test.ts`.
5. Run:
   - `npm run typecheck`
   - `npx vitest run src/__tests__/middleware.test.ts src/lib/auth/__tests__/authOptions.test.ts`
6. Commit with:
   - `test(auth): port middleware gwt coverage`

### P2 - `origin/feat/89-llm-q01-gemini-model-swap`

Conflict files:
- stale shared files: admin health, morning briefing cron, `src/app/page.tsx`, action tests
- LLM files: `src/lib/llm/__tests__/promptBuilder.test.ts`, `src/lib/llm/promptBuilder.ts`

Current finding:
- `main` already has `GEMINI_MODEL` support in `src/lib/llm/gemini.ts`.
- This branch's likely useful delta is stronger Gemini model env-var validation in `src/lib/llm/__tests__/gemini.test.ts`.

Steps:
1. Inspect only Gemini-specific delta:
   - `git diff HEAD..origin/feat/89-llm-q01-gemini-model-swap -- src/lib/llm/gemini.ts src/lib/llm/__tests__/gemini.test.ts`
2. Port missing tests manually into current `src/lib/llm/__tests__/gemini.test.ts`.
3. Avoid merging branch-wide stale LLM pipeline files unless they are required by the test.
4. Run:
   - `npm run typecheck`
   - `npx vitest run src/lib/llm/__tests__/gemini.test.ts`
5. Commit with:
   - `test(llm): cover gemini model env swap`

### P3 - `origin/feat/101-test-f9-03-retry-integration`

Conflict files:
- admin health route and tests
- morning briefing cron route and tests
- `src/app/page.tsx`
- `saveRiskProfile` and `saveWatchlist` tests
- `src/lib/dto/__tests__/llmOutput.test.ts`
- `src/lib/llm/__tests__/promptBuilder.test.ts`
- `src/lib/llm/promptBuilder.ts`

Current finding:
- The branch carries broad stale LLM pipeline work plus TEST-F9-01/02/03 tests.
- Direct merge risks overwriting newer DTO, market-data, cron, and app-router decisions.

Steps:
1. Create a temporary working branch from current `main`:
   - `git switch -c reconcile/llm-retry-tests`
2. Inspect only LLM retry/test files:
   - `git diff HEAD..origin/feat/101-test-f9-03-retry-integration -- src/lib/llm src/lib/dto`
3. Port tests in this order:
   - DTO boundary tests that are still missing
   - LLM failure scenario tests
   - retry integration tests
4. For each test group, adapt imports to current module names. Do not recreate older `generateCards*` APIs unless current `main` still needs them.
5. Run after each group:
   - `npx vitest run src/lib/llm src/lib/dto`
6. Final verification:
   - `npm run typecheck`
   - `npm test`
7. Merge the reconciliation branch into `main` only after all tests pass.

### P4 - `origin/feat/103-test-f2-01-card-query-test`

Conflict files:
- same stale shared files as P3
- additional conflict: `src/lib/queries/__tests__/getTodayRecommendations.test.ts`

Current finding:
- Useful delta is likely TEST-F2-01 card query GWT coverage.
- It should be handled after P3 because both touch recommendation DTO/LLM/query assumptions.

Steps:
1. Start after P3 is merged or explicitly skipped.
2. Inspect query-only delta:
   - `git diff HEAD..origin/feat/103-test-f2-01-card-query-test -- src/lib/queries src/lib/dto`
3. Port only missing `getTodayRecommendations` test cases.
4. Confirm tests align with current Prisma schema and mock data.
5. Run:
   - `npm run typecheck`
   - `npx vitest run src/lib/queries/__tests__/getTodayRecommendations.test.ts src/lib/dto/__tests__/todayRecommendations.test.ts`
6. Commit with:
   - `test(rec): port recommendation query gwt coverage`

### P5 - `origin/feat/38-push-c02-morning-briefing-cron`

Conflict files:
- package files
- docs loop file
- admin health
- app pages
- action tests
- auth tests
- LLM prompt/Gemini files
- performance query files

Current finding:
- This is not a single-feature branch anymore. It contains several merged PR histories and multiple merge bases.
- Direct merge should be avoided.

Steps:
1. Split into isolated reconciliation branches:
   - `reconcile/push-cron`
   - `reconcile/login-ui`
   - `reconcile/onboarding-update-watchlist`
   - `reconcile/ux-docs`
2. For push cron only, inspect:
   - `git diff HEAD..origin/feat/38-push-c02-morning-briefing-cron -- src/app/api/cron/morning-briefing src/lib/push vercel.json`
3. Keep current `main` route shape unless the branch has missing OneSignal behavior.
4. For login UI only, inspect:
   - `git diff HEAD..origin/feat/38-push-c02-morning-briefing-cron -- src/app/login src/app/pages/LoginPage.tsx src/app/pages/LoginPageV2.tsx`
5. For onboarding update action only, inspect:
   - `git diff HEAD..origin/feat/38-push-c02-morning-briefing-cron -- src/lib/actions src/app/pages/SettingsPageV2.tsx src/app/pages/OnboardingPageV2.tsx`
6. Run targeted tests per slice, then full verification:
   - `npm run typecheck`
   - `npm test`
7. Merge only completed slices; leave the original broad branch unmerged.

### P6 - `origin/feat/16-ux-002-user-journey-ia`

Conflict files:
- package files
- docs loop file
- stale shared app/API/action/LLM/query files

Current finding:
- Primary valuable artifact is `docs/ux/UX-002-user-journey-ia.md`.
- Runtime changes in this branch are stale and should not be merged blindly.

Steps:
1. Extract only the UX document and report if still useful:
   - `git show origin/feat/16-ux-002-user-journey-ia:docs/ux/UX-002-user-journey-ia.md`
   - `git show origin/feat/16-ux-002-user-journey-ia:reports/issue-16-ux-002.md`
2. Add or update docs manually on current `main`.
3. Do not accept package or runtime conflicts from this branch.
4. Run:
   - `npm run typecheck`
5. Commit with:
   - `docs(ux): port user journey ia`

### P7 - `origin/feat/33-ux-004-responsive-accessibility`

Conflict files:
- same stale package/runtime conflict set as P6

Current finding:
- Primary valuable artifact is `docs/ux/UX-004-responsive-accessibility-baseline.md`.

Steps:
1. Complete P6 first so UX docs can be reviewed in sequence.
2. Extract only:
   - `docs/ux/UX-004-responsive-accessibility-baseline.md`
   - `reports/issue-33-ux-004.md`
3. Check consistency with existing `docs/ux/UX-016-design-qa-usability-handoff.md`.
4. Do not accept stale package/runtime conflicts.
5. Run:
   - `npm run typecheck`
6. Commit with:
   - `docs(ux): port responsive accessibility baseline`

### P8 - `origin/feat/34-ux-005-auth-session-ux`

Conflict files:
- same stale package/runtime conflict set as P6/P7

Current finding:
- Primary valuable artifact is `docs/ux/UX-005-auth-session-ux.md`.
- It should follow P0/P1 so the documentation reflects the actual middleware/session behavior in `main`.

Steps:
1. Finish auth middleware reconciliation first.
2. Extract only:
   - `docs/ux/UX-005-auth-session-ux.md`
   - `reports/issue-34-ux-005.md`
3. Align copy with current `src/middleware.ts`, `src/app/api/auth/[...nextauth]/route.ts`, and login routes.
4. Do not accept stale package/runtime conflicts.
5. Run:
   - `npm run typecheck`
6. Commit with:
   - `docs(ux): port auth session ux`

## General Merge Procedure

Use this procedure for each remaining branch or extracted slice:

1. Start clean:
   - `git status --short --branch`
2. Update remote refs:
   - `git fetch --all --prune`
3. Create a reconciliation branch from `main`:
   - `git switch main`
   - `git pull --ff-only origin main`
   - `git switch -c reconcile/<topic>`
4. Inspect branch-specific delta before editing:
   - `git diff HEAD..<branch> -- <target paths>`
5. Prefer manual porting or targeted cherry-pick over full branch merge when the branch carries stale shared files.
6. Keep each reconciliation branch to one purpose:
   - auth middleware
   - Gemini model test
   - LLM retry tests
   - recommendation query tests
   - push cron
   - UX docs
7. Run targeted tests first.
8. Run final verification:
   - `npm run typecheck`
   - `npm test`
9. Merge reconciliation branch into `main`.
10. Push `main`.

## Branches Recommended to Close After Reconciliation

After the targeted work is ported and verified, these original branches should be closed instead of force-merged:

- `origin/feat/34-auth-c02-middleware-auth`
- `origin/feat/44-auth-c02-middleware`
- `origin/feat/89-llm-q01-gemini-model-swap`
- `origin/feat/101-test-f9-03-retry-integration`
- `origin/feat/103-test-f2-01-card-query-test`
- `origin/feat/38-push-c02-morning-briefing-cron`
- `origin/feat/16-ux-002-user-journey-ia`
- `origin/feat/33-ux-004-responsive-accessibility`
- `origin/feat/34-ux-005-auth-session-ux`

Rationale: the remaining branches include useful work, but most also include stale commits already superseded by current `main`. Closing them after targeted reconciliation keeps history understandable and avoids reintroducing outdated package, API, and App Router changes.
