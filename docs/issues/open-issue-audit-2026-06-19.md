# Open Issue Audit — 2026-06-19

## 기준
- GitHub API 확인 당시 열린 이슈: 54개.
- 로컬 검증은 `node_modules` 미설치로 `typecheck`, `test`, `build`가 실행되지 않았다.
- 외부 콘솔/배포/이슈 close 권한이 필요한 항목은 승인 요청 없이 blocked로 분류했다.

## 상태 요약
- `close-ready-local`: 로컬 코드/테스트 또는 문서가 이미 존재하거나 이번 변경으로 보강됨.
- `needs-app-router-integration`: V2 프로토타입에는 있으나 실제 Next App Router 화면 또는 route와 아직 연결되지 않음.
- `needs-code`: 로컬 코드 추가가 더 필요함.
- `console-evidence-needed`: Vercel, Supabase, PostHog, OneSignal 콘솔 증적이 필요함.
- `verification-blocked`: 의존성 설치가 필요함.

## 이슈별 상태
| Issue | Task | Status | Evidence / Next step |
|---:|---|---|---|
| #12 | INFRA-002 | console-evidence-needed | Vercel 프로젝트 연결/자동 배포 증적 필요 |
| #13 | INFRA-004 | console-evidence-needed | Supabase pooler 연결 문자열 증적 필요 |
| #15 | SEC-004 | console-evidence-needed | 개인정보 최소 수집/브로커 권한 미저장 감사 증적 필요 |
| #19 | AVAIL-001 | console-evidence-needed | Supabase backup RPO 설정 증적 필요 |
| #20 | AVAIL-002 | close-ready-local | `docs/ops-disaster-recovery-runbook.md` 추가 |
| #21 | AVAIL-003 | console-evidence-needed | pooler 또는 Accelerate 적용 증적 필요 |
| #26 | INFRA-003 | console-evidence-needed | Vercel env 설정 증적 필요, `.env.example` health keys 보강됨 |
| #27 | MON-001 | close-ready-local | `src/app/api/admin/health/route.ts` 추가 |
| #28 | MON-002 | console-evidence-needed | Vercel dashboard alert 증적 필요 |
| #29 | MON-005 | console-evidence-needed | Vercel/Supabase 보안 모니터링 증적 필요 |
| #30 | SEC-001 | console-evidence-needed | TLS 설정 검증 증적 필요 |
| #31 | SEC-002 | console-evidence-needed | Supabase encryption 증적 필요 |
| #32 | SEC-003 | console-evidence-needed | RBAC 운영 권한 증적 필요 |
| #67 | SEC-005 | console-evidence-needed | PostHog/로그 보관 정책 증적 필요 |
| #72 | UX-007 | needs-app-router-integration | V2 홈 카드 UX 존재, 실제 RSC 표면 정렬 필요 |
| #73 | ARC-Q02 | needs-app-router-integration | V2 archive 존재, 실제 App Router 화면 연결 필요 |
| #75 | MON-004 | console-evidence-needed | OneSignal dashboard alert 증적 필요 |
| #77 | PERF-002 | verification-blocked | 상세 렌더 성능 측정 의존성/실행 환경 필요 |
| #80 | REC-Q03 | needs-app-router-integration | V2 `RecommendationCard` 존재, 실제 RSC 카드 표면 보강 필요 |
| #82 | UX-008 | needs-app-router-integration | V2 상세 chartless UX 존재, 실제 detail route 필요 |
| #83 | UX-009 | close-ready-local | V2 confidence toggle 및 이벤트 보강 |
| #84 | UX-013 | needs-app-router-integration | push UX 일부 존재, 실제 OneSignal flow 증적 필요 |
| #85 | CONF-Q01 | close-ready-local | V2 confidence 3단계 전환 및 `confidence_*` 이벤트 보강 |
| #88 | LLM-C07 | close-ready-local | `persistRecommendationGeneration()` 추가 |
| #89 | LLM-Q01 | close-ready-local | `GEMINI_MODEL` 기반 Gemini model helper 존재 |
| #90 | PERF-001 | verification-blocked | 추천 API p95 측정 환경 필요 |
| #91 | PERF-004 | verification-blocked | `streamObject()` timeout 측정 환경 필요 |
| #92 | TEST-F6-01 | close-ready-local | cron route test 존재, 실행은 dependency install 필요 |
| #93 | TEST-F9-01 | close-ready-local | LLM schema tests 존재, 실행은 dependency install 필요 |
| #94 | UX-010 | close-ready-local | V2 No Call/loading/empty/error states 존재 |
| #95 | LLM-C08 | close-ready-local | persistence helper가 EvidenceSnapshot nested create 지원 |
| #96 | PERF-003 | verification-blocked | bundle 측정은 dependency install 필요 |
| #97 | REC-Q04 | needs-app-router-integration | V2 No Call screen 존재, 실제 RSC no-call card UX 보강 필요 |
| #98 | TEST-F3-01 | close-ready-local | DTO price/holdDays tests 존재 |
| #99 | TEST-F4-02 | close-ready-local | `src/app/lib/__tests__/confidenceRecommendations.test.ts` 추가 |
| #100 | TEST-F9-02 | close-ready-local | LLM failure tests 존재 |
| #101 | TEST-F9-03 | close-ready-local | validation retry tests 존재 |
| #102 | UX-011 | close-ready-local | V2 trust/reason/performance UX 및 `reason_expand` 보강 |
| #103 | TEST-F2-01 | close-ready-local | today recommendations query tests 존재 |
| #104 | TRUST-Q02 | needs-app-router-integration | V2 performance card 존재, 실제 detail route 연결 필요 |
| #105 | TRUST-Q04 | close-ready-local | V2 detail 유사 패턴 섹션 추가, 데이터 없으면 숨김 |
| #106 | UX-015 | close-ready-local | V2 이벤트 touchpoints 일부 보강, 전체 실제 App Router 연결 필요 |
| #107 | PUSH-Q01 | needs-app-router-integration | hash deeplink events 보강, 실제 push landing route 증적 필요 |
| #108 | REC-C01 | close-ready-local | price copy handler 및 `price_copy` 이벤트 존재 |
| #109 | REC-C02 | close-ready-local | broker redirect handler 및 execution/broker events 보강 |
| #110 | TEST-F5-02 | close-ready-local | performance query tests 존재 |
| #111 | TRUST-Q03 | close-ready-local | reasonLine display 및 `reason_expand` 이벤트 보강 |
| #112 | UX-016 | close-ready-local | `docs/ux/UX-016-design-qa-usability-handoff.md` 추가 |
| #113 | EVT-C03 | needs-app-router-integration | V2 client events 보강, 실제 App Router 표면 이벤트 연결 필요 |
| #114 | REC-Q05 | close-ready-local | V2 detail main fold chartless, source search shows no RSI/MACD widgets in page surface |
| #115 | TEST-F6-02 | close-ready-local | `src/app/__tests__/routes.test.ts`로 push deeplink route 계약 검증 |
| #116 | EVT-Q01 | close-ready-local | `docs/analytics-posthog-kpi-dashboard-guide.md` 추가 |
| #117 | TEST-F7-01 | close-ready-local | `src/lib/analytics/__tests__/eventIntegration.test.ts` 추가 |
| #118 | MON-003 | console-evidence-needed | PostHog KPI dashboard 실제 콘솔 증적 필요 |

## 이번 로컬 변경
- PostHog client event bridge: `AppContext.addDebugEvent()`가 유효한 SRS client event를 `posthog-js`로 전송.
- V2 UI event 보강: `home_view`, `rec_card_impression`, `rec_card_click`, `confidence_view`, `confidence_change`, `rec_detail_view`, `performance_card_view`, `reason_expand`, `price_copy`, `alert_set`, `execution_intent_submit`, `broker_redirect`, `push_open`, `deeplink_success/fail`.
- `/api/admin/health` route 추가.
- LLM generation persistence helper 및 tests 추가.

## Blocked
- GitHub issue close/comment: `gh` CLI 미설치 및 인증 필요.
- Verification: `node_modules` 미설치로 `tsc`, `vitest`, `next` 실행 불가.
- Console evidence: Vercel, Supabase, PostHog, OneSignal 접근 권한 필요.
