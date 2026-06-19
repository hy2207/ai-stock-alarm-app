# Open Issue Audit — 2026-06-19

## 기준
- GitHub API 확인 당시 열린 이슈: 54개, 2026-06-19 재확인 후 열린 이슈: 26개.
- 이전 차수에서 로컬 의존성 설치 후 `npm run typecheck`, `npm test`, `npm run build`를 통과했고 close-ready 항목 다수를 GitHub에서 종료했다.
- 이번 차수는 `app-router-remaining-issues-20260619` 브랜치에서 토큰 없이 처리 가능한 App Router 표면 연결을 진행한다.

## 상태 요약
- `close-ready-local`: 로컬 코드/테스트 또는 문서가 이미 존재하거나 이번 변경으로 보강됨.
- `close-ready-branch`: 이번 브랜치 변경과 로컬 검증으로 닫을 수 있음.
- `closed-github`: GitHub에서 완료 코멘트와 함께 종료됨.
- `code-ready-external-evidence`: 코드 경로는 준비됐지만 실서비스 콘솔/토큰/발송 증적이 필요함.
- `partial-code-ready`: 이번 브랜치에서 핵심 경로를 보강했지만 전체 이슈 DoD 완료 전 추가 UI 터치포인트가 남음.
- `needs-app-router-integration`: V2 프로토타입에는 있으나 실제 Next App Router 화면 또는 route와 아직 연결되지 않음.
- `needs-code`: 로컬 코드 추가가 더 필요함.
- `console-evidence-needed`: Vercel, Supabase, PostHog, OneSignal 콘솔 증적이 필요함.
- `verification-blocked`: 배포/warm serverless/외부 API 응답 시간처럼 로컬 단독 검증으로는 충분하지 않음.

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
| #72 | UX-007 | closed-github | `/` App Router 표면에 방향/가격/보유기간/confidence/reasonLine/면책/No Call 표시 연결, PR #184 코멘트 후 종료 |
| #73 | ARC-Q02 | closed-github | `/archive` App Router 화면에서 성공/실패 포함 성과 이력 렌더링, PR #184 코멘트 후 종료 |
| #75 | MON-004 | console-evidence-needed | OneSignal dashboard alert 증적 필요 |
| #77 | PERF-002 | verification-blocked | 상세 렌더 성능 측정 의존성/실행 환경 필요 |
| #80 | REC-Q03 | closed-github | `RecommendationCardLink`가 실제 RSC 홈 카드로 ticker/direction/price/hold/confidence/reasonLine 렌더링, PR #184 코멘트 후 종료 |
| #82 | UX-008 | closed-github | `/recommendations/[recId]` App Router 상세가 chartless main fold, 근거, 성과, 유사 패턴 진입 제공, PR #184 코멘트 후 종료 |
| #83 | UX-009 | close-ready-local | V2 confidence toggle 및 이벤트 보강 |
| #84 | UX-013 | closed-github | push landing query(`from=push`, `utm_source=onesignal`) 이벤트와 fallback 문서화, PR #184 코멘트 후 종료. OneSignal 실제 발송 증적은 #75/#107에서 별도 확인 |
| #85 | CONF-Q01 | close-ready-local | V2 confidence 3단계 전환 및 `confidence_*` 이벤트 보강 |
| #88 | LLM-C07 | close-ready-local | `persistRecommendationGeneration()` 추가 |
| #89 | LLM-Q01 | close-ready-local | `GEMINI_MODEL` 기반 Gemini model helper 존재 |
| #90 | PERF-001 | verification-blocked | 추천 API p95 측정 환경 필요 |
| #91 | PERF-004 | verification-blocked | `streamObject()` timeout 측정 환경 필요 |
| #92 | TEST-F6-01 | close-ready-local | cron route test 존재, 실행은 dependency install 필요 |
| #93 | TEST-F9-01 | close-ready-local | LLM schema tests 존재, 실행은 dependency install 필요 |
| #94 | UX-010 | close-ready-local | V2 No Call/loading/empty/error states 존재 |
| #95 | LLM-C08 | close-ready-local | persistence helper가 EvidenceSnapshot nested create 지원 |
| #96 | PERF-003 | close-ready-local | `npm run build` First Load JS 87.4 kB로 150 kB 기준 충족 |
| #97 | REC-Q04 | closed-github | `/` App Router가 인증/데이터 없음 상태를 No Call 안내로 렌더링하고 5xx 없이 처리, PR #184 코멘트 후 종료 |
| #98 | TEST-F3-01 | close-ready-local | DTO price/holdDays tests 존재 |
| #99 | TEST-F4-02 | close-ready-local | `src/app/lib/__tests__/confidenceRecommendations.test.ts` 추가 |
| #100 | TEST-F9-02 | close-ready-local | LLM failure tests 존재 |
| #101 | TEST-F9-03 | close-ready-local | validation retry tests 존재 |
| #102 | UX-011 | close-ready-local | V2 trust/reason/performance UX 및 `reason_expand` 보강 |
| #103 | TEST-F2-01 | close-ready-local | today recommendations query tests 존재 |
| #104 | TRUST-Q02 | closed-github | `/recommendations/[recId]`, `/archive`에서 성공률/실패/수익률/빈 상태 성과 카드 렌더링, PR #184 코멘트 후 종료 |
| #105 | TRUST-Q04 | close-ready-local | V2 detail 유사 패턴 섹션 추가, 데이터 없으면 숨김 |
| #106 | UX-015 | close-ready-local | V2 이벤트 touchpoints 일부 보강, 전체 실제 App Router 연결 필요 |
| #107 | PUSH-Q01 | code-ready-external-evidence | `/` push query 랜딩과 `/recommendations/[recId]` 상세 라우팅 연결, `push_open`/`deeplink_success` 이벤트 보강. OneSignal 실발송 latency 증적 필요 |
| #108 | REC-C01 | close-ready-local | price copy handler 및 `price_copy` 이벤트 존재 |
| #109 | REC-C02 | close-ready-local | broker redirect handler 및 execution/broker events 보강 |
| #110 | TEST-F5-02 | close-ready-local | performance query tests 존재 |
| #111 | TRUST-Q03 | close-ready-local | reasonLine display 및 `reason_expand` 이벤트 보강 |
| #112 | UX-016 | close-ready-local | `docs/ux/UX-016-design-qa-usability-handoff.md` 추가 |
| #113 | EVT-C03 | partial-code-ready | App Router 표면에 `home_view`, `rec_card_impression`, `rec_card_click`, `rec_detail_view`, `performance_card_view`, `push_open`, `deeplink_success` 연결. 나머지 client event는 V2 표면에는 있으나 실제 App Router 액션 확장 필요 |
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
- App Router `/`, `/recommendations/[recId]`, `/archive` 표면 연결.
- `docs/env-external-issue-runbook.md`로 env/token/console 증적 절차 분리.

## 이번 검증
- `conda activate self_study && npm run typecheck`: pass.
- `conda activate self_study && DATABASE_URL=file:/private/tmp/ai-stock-alarm-self-study-test-remaining.db npm test`: 42 files / 344 tests pass.
- `conda activate self_study && DATABASE_URL=file:/private/tmp/ai-stock-alarm-self-study-test-remaining.db npm run build`: pass, App Router pages First Load JS 97.3-97.4 kB.

## Blocked
- Console evidence: Vercel, Supabase, PostHog, OneSignal 접근 권한과 실제 토큰/프로젝트 값 필요.
- Perf evidence: #77, #90, #91은 배포 또는 warm serverless 환경 기준 측정 증적 필요.
