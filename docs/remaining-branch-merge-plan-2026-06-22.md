# Remaining Branch Merge Plan - 2026-06-22

## Current Baseline

- Base branch: `main`
- Base commit at latest update: `1191997 test(rec): port recommendation query gwt coverage`
- Working tree status at latest update: clean
- Completed branch cleanup: remote branches already merged or reconciled into `main` were deleted from GitHub.

## Completed and Deleted Branches

These branches have already been merged directly or reconciled into current `main`, then deleted from `origin`.

Directly merged into `main`:
- `origin/app-router-remaining-issues-20260619`
- `origin/issue-cleanup-20260619`
- `origin/feat/27-conf-c01-save-riskprofile`
- `origin/feat/28-onb-c01-save-watchlist`
- `origin/feat/30-dto-010-price-validation`
- `origin/feat/31-dto-006-rec-detail-dto`
- `origin/feat/32-dto-004-llm-output-schema`
- `origin/feat/33-llm-c02-market-data`
- `origin/feat/42-trust-q01-performance-query`
- `origin/feat/44-dto-006-rec-detail`

Reconciled into `main` without direct merge because the branch contained stale shared history:
- P0 `origin/feat/34-auth-c02-middleware-auth`
  - Result: `f810e60 fix(auth): align middleware guard with srs`
  - Main keeps the newer custom middleware, protects `/`, preserves query-string `callbackUrl`, handles token refresh errors, and excludes cron/health routes from NextAuth middleware.
- P1 `origin/feat/44-auth-c02-middleware`
  - Result: `31f5915 fix(auth): use app login page for sign-in`
  - Main only adopted the valid `authOptions.pages.signIn = "/login"` behavior.
- P2 `origin/feat/89-llm-q01-gemini-model-swap`
  - Result: `49ee284 test(llm): cover gemini model env swap`
  - Main kept the correct Vercel AI SDK provider-call style and added env-swap tests without requiring a real API key.
- P3 `origin/feat/101-test-f9-03-retry-integration`
  - Result: `baae82c test(llm): port retry failure coverage`
  - Main kept the current `generateRecommendationCards()` flow and ported retry/failure classification coverage.
- P4 `origin/feat/103-test-f2-01-card-query-test`
  - Result: `1191997 test(rec): port recommendation query gwt coverage`
  - Main kept the current recommendation query implementation and ported GWT coverage for required fields, entry ranges, and auth failure propagation.
- P5 `origin/feat/38-push-c02-morning-briefing-cron`
  - Result: P5 reconciliation commit in this update
  - Main reconciles push cron revocation sync, Vercel Cron config, App Router `/login`, and `updateWatchlist()` without direct-merging stale UI/report deletions.

## Remaining Branches

Current unmerged remote branches:
- `origin/feat/16-ux-002-user-journey-ia`
- `origin/feat/33-ux-004-responsive-accessibility`
- `origin/feat/34-ux-005-auth-session-ux`

## Updated Priority Summary

| Priority | Branch | Why | Recommended Strategy |
|---|---|---|---|
| P6 | `origin/feat/16-ux-002-user-journey-ia` | Mostly UX documentation. Lower runtime risk and useful product reference. | Extract doc/report artifacts only. Skip stale package/runtime changes. |
| P7 | `origin/feat/33-ux-004-responsive-accessibility` | UX accessibility documentation. Useful after core query/push work. | Extract doc/report artifacts only and align with current UX docs. |
| P8 | `origin/feat/34-ux-005-auth-session-ux` | Auth-session UX documentation should reflect the already reconciled P0/P1 auth behavior. | Extract doc/report artifacts only after auth behavior is stable, which it now is. |

## P5 - Push Cron / Login / Onboarding Split

Branch:
- `origin/feat/38-push-c02-morning-briefing-cron`

Known conflict theme:
- This is not a single-feature branch anymore.
- It includes several PR histories and multiple feature slices.
- Direct merge should be avoided.

Completed runtime slices:
- Push cron invalid OneSignal external user IDs are now synced to `consentPush=false`.
- Vercel Cron config now schedules `/api/cron/morning-briefing`.
- App Router `/login` page now exists for the P0/P1 auth flow.
- `updateWatchlist()` Server Action now supports post-onboarding settings updates.

Skipped stale slices:
- Prototype `OnboardingPageV2` and `SettingsPageV2` changes that would remove current selection helpers.
- Component/report deletions that would undo newer `main` work.
- Email login UI because current `authOptions` only configures Google and Kakao providers.

Delete after this P5 pass is pushed:
- `git push origin --delete feat/38-push-c02-morning-briefing-cron`

## P6 - UX-002 User Journey IA

Branch:
- `origin/feat/16-ux-002-user-journey-ia`

Primary useful artifacts:
- `docs/ux/UX-002-user-journey-ia.md`
- `reports/issue-16-ux-002.md`

Steps:
1. Extract only docs/report artifacts:
   - `git show origin/feat/16-ux-002-user-journey-ia:docs/ux/UX-002-user-journey-ia.md`
   - `git show origin/feat/16-ux-002-user-journey-ia:reports/issue-16-ux-002.md`
2. Add/update docs manually on current `main`.
3. Do not accept stale package/runtime changes.
4. Run:
   - `npm run typecheck`
5. Commit with:
   - `docs(ux): port user journey ia`
6. Delete the remote branch after successful push:
   - `git push origin --delete feat/16-ux-002-user-journey-ia`

## P7 - UX-004 Responsive Accessibility

Branch:
- `origin/feat/33-ux-004-responsive-accessibility`

Primary useful artifacts:
- `docs/ux/UX-004-responsive-accessibility-baseline.md`
- `reports/issue-33-ux-004.md`

Steps:
1. Complete or intentionally skip P6 first so UX docs stay ordered.
2. Extract only docs/report artifacts:
   - `git show origin/feat/33-ux-004-responsive-accessibility:docs/ux/UX-004-responsive-accessibility-baseline.md`
   - `git show origin/feat/33-ux-004-responsive-accessibility:reports/issue-33-ux-004.md`
3. Check consistency with:
   - `docs/ux/UX-016-design-qa-usability-handoff.md`
4. Do not accept stale package/runtime changes.
5. Run:
   - `npm run typecheck`
6. Commit with:
   - `docs(ux): port responsive accessibility baseline`
7. Delete the remote branch after successful push:
   - `git push origin --delete feat/33-ux-004-responsive-accessibility`

## P8 - UX-005 Auth Session UX

Branch:
- `origin/feat/34-ux-005-auth-session-ux`

Primary useful artifacts:
- `docs/ux/UX-005-auth-session-ux.md`
- `reports/issue-34-ux-005.md`

Steps:
1. Extract only docs/report artifacts:
   - `git show origin/feat/34-ux-005-auth-session-ux:docs/ux/UX-005-auth-session-ux.md`
   - `git show origin/feat/34-ux-005-auth-session-ux:reports/issue-34-ux-005.md`
2. Align the document with current auth behavior:
   - `src/middleware.ts` protects `/` and app routes.
   - `/api/cron/*` and `/api/admin/health` are public to NextAuth middleware but guarded by their own route logic where applicable.
   - `src/lib/auth/authOptions.ts` uses `pages.signIn = "/login"`.
3. Do not accept stale package/runtime changes.
4. Run:
   - `npm run typecheck`
5. Commit with:
   - `docs(ux): port auth session ux`
6. Delete the remote branch after successful push:
   - `git push origin --delete feat/34-ux-005-auth-session-ux`

## General Reconciliation Procedure

Use this procedure for each remaining branch:

1. Start clean:
   - `git status --short --branch`
2. Update remote refs:
   - `git fetch --all --prune`
3. Inspect only target paths:
   - `git diff HEAD..<branch> -- <target paths>`
4. Prefer manual porting over direct merge if the branch includes stale shared history.
5. Keep each commit to one purpose.
6. Run targeted tests first.
7. Run final verification:
   - `npm run typecheck`
   - `DATABASE_URL=file:./dev.db npm test`
8. Push `main`.
9. Delete the completed remote branch.
