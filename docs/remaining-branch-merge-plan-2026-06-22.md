# Remaining Branch Merge Plan - 2026-06-22

## Current Baseline

- Base branch: `main`
- Base commit at latest update: `0c549e3 feat(push): reconcile briefing cron slices`
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
  - Result: `0c549e3 feat(push): reconcile briefing cron slices`
  - Main reconciles push cron revocation sync, Vercel Cron config, App Router `/login`, and `updateWatchlist()` without direct-merging stale UI/report deletions.
- P6 `origin/feat/16-ux-002-user-journey-ia`
  - Result: `94656ec docs(ux): port user journey ia`
  - Main ported the UX-002 user journey/IA contract, issue report, and focused document-contract test while skipping stale harness, package, runtime, and deletion churn.
- P7 `origin/feat/33-ux-004-responsive-accessibility`
  - Result: `daa1724 docs(ux): port responsive accessibility baseline`
  - Main ported the UX-004 responsive/accessibility baseline, issue report, and focused document-contract test while preserving existing UX-002 and UX-016 docs.
- P8 `origin/feat/34-ux-005-auth-session-ux`
  - Result: `docs(ux): port auth session ux`
  - Main ported the UX-005 auth/session contract, issue report, and focused document-contract test after aligning it to the current Google/Kakao-only login and safe `callbackUrl` behavior.

## Remaining Branches

Current unmerged remote branches:
- None.

## Updated Priority Summary

All prioritized remaining branches have been reconciled into `main` and deleted from `origin`.

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

Completed:
- Ported `docs/ux/UX-002-user-journey-ia.md`.
- Ported `reports/issue-16-ux-002.md` and updated verification commands to the current npm/Vitest workflow.
- Ported `src/lib/ux/__tests__/userJourneyIa.test.ts` as a focused document-contract test.
- Skipped stale package/runtime changes and unrelated report/doc deletions.

Verification:
- `npx vitest run src/lib/ux/__tests__/userJourneyIa.test.ts`
- `npm run typecheck`

Delete after this P6 pass is pushed:
- `git push origin --delete feat/16-ux-002-user-journey-ia`

## P7 - UX-004 Responsive Accessibility

Branch:
- `origin/feat/33-ux-004-responsive-accessibility`

Primary useful artifacts:
- `docs/ux/UX-004-responsive-accessibility-baseline.md`
- `reports/issue-33-ux-004.md`

Completed:
- Ported `docs/ux/UX-004-responsive-accessibility-baseline.md`.
- Ported `reports/issue-33-ux-004.md` and updated verification commands to the current npm/Vitest workflow.
- Ported `src/lib/ux/__tests__/responsiveAccessibility.test.ts` as a focused document-contract test.
- Skipped stale package/runtime changes and unrelated report/doc/test deletions.

Verification:
- `npx vitest run src/lib/ux/__tests__/responsiveAccessibility.test.ts`
- `npm run typecheck`

Delete after this P7 pass is pushed:
- `git push origin --delete feat/33-ux-004-responsive-accessibility`

## P8 - UX-005 Auth Session UX

Branch:
- `origin/feat/34-ux-005-auth-session-ux`

Primary useful artifacts:
- `docs/ux/UX-005-auth-session-ux.md`
- `reports/issue-34-ux-005.md`

Completed:
- Ported `docs/ux/UX-005-auth-session-ux.md`.
- Aligned the UX spec with current `src/lib/auth/authOptions.ts` providers: Google and Kakao only.
- Aligned callback wording with current `/login` behavior: safe `callbackUrl` first, legacy `returnTo` compatibility.
- Ported `reports/issue-34-ux-005.md` and updated verification commands to the current npm/Vitest workflow.
- Ported `src/lib/ux/__tests__/authSessionUx.test.ts` as a focused document-contract test.
- Skipped stale package/runtime changes and unrelated report/doc/test deletions.

Verification:
- `npx vitest run src/lib/ux/__tests__/authSessionUx.test.ts`
- `npm run typecheck`

Remote cleanup:
- Deleted `origin/feat/34-ux-005-auth-session-ux` after pushing the P8 reconciliation.

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
