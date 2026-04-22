# Task Extraction Report

**Report ID:** TASK-EXTRACT-001  
**Generated Date:** 2026-04-22  
**Source SRS:** [`SRS-v1.md`](./SRS-v1.md)  
**Source Task List:** [`task-list-v1.md`](./task-list-v1.md)  
**Output Directory:** [`./tasks`](./)  
**Status:** Completed

---

## 1. Summary

SRS v1.0의 기능 요구사항, 데이터 모델, API/Server Action, 비기능 요구사항을 기반으로 개발 가능한 GitHub Issue 형태의 태스크 명세서를 추출했다.

추출 결과는 `task-list-v1.md`의 실제 Task ID 행을 기준으로 하며, 각 태스크는 다음 형식을 포함한다.

- GitHub Issue frontmatter
- Summary
- References
- Task Breakdown
- Acceptance Criteria (BDD/GWT)
- Technical & Non-Functional Constraints
- Definition of Done
- Dependencies & Blockers

> Note: `task-list-v1.md` 하단 요약에는 총 78개로 표기되어 있으나, 실제 Task ID 표 행은 102개다. 본 보고서와 생성 산출물은 표에 존재하는 실제 102개 Task ID를 기준으로 한다.

---

## 2. Extraction Scope

| 구분 | 내용 |
|---|---|
| 원천 문서 | `tasks/SRS-v1.md`, `tasks/task-list-v1.md` |
| 보조 컨텍스트 | `tasks/PRD_v1.md`, `../modu-2026` 내 기존 산출물 |
| 추출 기준 | `task-list-v1.md`의 Task ID, Epic, Feature, SRS Reference, Dependency, Complexity |
| 산출 형식 | GitHub Issue Template 기반 Markdown |
| 산출 위치 | `tasks/*.md` |
| 파일명 규칙 | `{TaskID}-{English_feature_summary}.md` |

---

## 3. Extraction Method

태스크 추출은 다음 기준으로 수행했다.

1. **Contract First**
   - Prisma 데이터 모델, DTO/Zod schema, API/Server Action contract를 먼저 분리했다.
   - Foundation 태스크는 후속 구현 태스크의 SSOT가 되도록 구성했다.

2. **CQRS-Oriented Feature Breakdown**
   - 기능 구현 태스크는 Command와 Query/UI 성격을 구분했다.
   - Server Action, Route Handler, Server Component, Client Component의 책임을 명확히 나눴다.

3. **Acceptance Criteria to Test Conversion**
   - SRS의 Given/When/Then 조건을 테스트 태스크로 별도 추출했다.
   - 외부 SaaS 및 LLM 연동은 mock/stub 기반 검증을 전제로 했다.

4. **NFR and Operations Extraction**
   - 성능, 보안, 모니터링, 가용성 요구사항을 별도 인프라/운영 태스크로 분리했다.
   - p95, timeout, RPO/RTO, 이벤트 누락률, 푸시 성공률 등 측정 가능한 기준을 포함했다.

---

## 4. Generated Output Summary

| 항목 | 결과 |
|---|---:|
| 실제 Task ID 수 | 102 |
| 생성된 Issue 명세 파일 수 | 102 |
| 기존 `issue-###-` prefix 파일 수 | 0 |
| 새 파일명 규칙 적용 여부 | 완료 |
| 필수 템플릿 섹션 포함 여부 | 완료 |

대표 산출 파일:

- [`DB-001-Prisma_dual_datasource_setup.md`](./DB-001-Prisma_dual_datasource_setup.md)
- [`DB-002-User_model_schema.md`](./DB-002-User_model_schema.md)
- [`DTO-003-RecommendationCard_output_schema.md`](./DTO-003-RecommendationCard_output_schema.md)
- [`AUTH-C01-NextAuth_initial_setup.md`](./AUTH-C01-NextAuth_initial_setup.md)
- [`LLM-C04-StreamObject_card_generation.md`](./LLM-C04-StreamObject_card_generation.md)
- [`AVAIL-003-Prisma_connection_pool_protection.md`](./AVAIL-003-Prisma_connection_pool_protection.md)

---

## 5. Task Distribution by Epic

| Epic | Count | 설명 |
|---|---:|---|
| Foundation | 23 | DB schema, DTO/Zod schema, mock data |
| Auth | 5 | NextAuth.js, middleware, session, account deletion, login UI |
| Onboarding | 4 | watchlist 저장/수정 및 온보딩/설정 UI |
| Recommendation | 7 | 추천 카드 조회, 상세, 렌더링, No Call, 가격 복사, 브로커 이동 |
| Confidence | 3 | riskMode 저장, 토글 UI, 세션 복원 |
| Trust Layer | 4 | 성과 기록, 성과 카드, reasonLine, 유사 패턴 섹션 |
| Push | 5 | OneSignal, morning briefing cron, Vercel Cron, deep link, opt-out filtering |
| Analytics | 4 | PostHog client/server tracking, taxonomy, KPI dashboard |
| Archive | 2 | ticker별 과거 추천 조회 및 목록 UI |
| LLM Pipeline | 9 | Gemini/Vercel AI SDK, market data, prompt, streamObject, retry/failure/persistence |
| Test | 15 | SRS Acceptance Criteria 기반 단위/통합/E2E 테스트 |
| Infra | 4 | Next.js scaffold, Vercel deploy, env vars, Supabase pooler |
| Infra/Perf | 4 | p95, bundle size, serverless timeout 성능 검증 |
| Infra/Sec | 5 | TLS, encryption, RBAC, data minimization, log retention |
| Infra/Ops | 5 | health endpoint, Vercel/PostHog/OneSignal/security monitoring |
| Infra/Avail | 3 | backup RPO, DR runbook, Prisma connection pool protection |
| **Total** | **102** | 실제 Task ID 행 기준 |

---

## 6. Task Distribution by Complexity

| Complexity | Count | 비율 |
|---|---:|---:|
| H | 11 | 10.8% |
| M | 62 | 60.8% |
| L | 29 | 28.4% |
| **Total** | **102** | **100%** |

주요 High complexity 태스크:

- `DTO-003` RecommendationCard 출력 Zod schema
- `DTO-004` LLM Structured Output JSON Schema
- `AUTH-C01` NextAuth.js 초기 설정
- `AUTH-C04` 사용자 탈퇴 처리
- `CONF-Q01` Confidence Score 토글 UI
- `PUSH-C02` Morning briefing Cron Handler
- `LLM-C02` 외부 시장 데이터 수집
- `LLM-C03` LLM Prompt Builder
- `LLM-C04` streamObject 기반 카드 생성
- `LLM-C05` 카드 검증 실패 재시도
- `TEST-F6-01` 아침 브리핑 Cron 통합 테스트

---

## 7. Traceability Summary

| SRS 영역 | 추출된 태스크 범위 |
|---|---|
| §1.5.2 기술 스택 제약 | `DB-001`, `INFRA-*`, `LLM-C01`, `LLM-Q01` |
| §3.1 External Systems | `MOCK-004`, `LLM-C02`, `PUSH-*`, `EVT-*`, `INFRA-004` |
| §6.1 API/Server Action List | `DTO-*`, `ONB-*`, `CONF-*`, `REC-*`, `PUSH-C02`, `MON-001` |
| §6.2 Entity & Data Model | `DB-001` ~ `DB-009` |
| F1 Onboarding | `ONB-C01` ~ `ONB-Q02`, `TEST-F1-01` |
| F2/F3 Recommendation | `REC-Q01` ~ `REC-C02`, `TEST-F2-01`, `TEST-F3-01` |
| F4 Confidence | `CONF-C01` ~ `CONF-Q02`, `TEST-F4-*` |
| F5 Trust Layer | `TRUST-Q01` ~ `TRUST-Q04`, `TEST-F5-*` |
| F6 Push | `PUSH-C01` ~ `PUSH-C04`, `PUSH-Q01`, `TEST-F6-*` |
| F7 Analytics | `EVT-C01` ~ `EVT-Q01`, `TEST-F7-01` |
| F8 Archive | `ARC-Q01`, `ARC-Q02` |
| F9 LLM Pipeline | `LLM-C01` ~ `LLM-Q01`, `TEST-F9-*` |
| F10 Auth | `AUTH-C01` ~ `AUTH-Q01`, `TEST-F10-*` |
| §4.2 NFR | `PERF-*`, `SEC-*`, `MON-*`, `AVAIL-*` |

---

## 8. Recommended Execution Order

권장 실행 순서는 의존성 그래프와 SRS 구현 리스크를 기준으로 다음과 같이 유지한다.

| Phase | Task Range | 목적 |
|---|---|---|
| Phase 0 | `INFRA-001` ~ `INFRA-003` | Next.js/Vercel 기본 환경 준비 |
| Phase 1 | `DB-*`, `DTO-*`, `MOCK-*` | 데이터 계약과 mock 기반 UI/테스트 준비 |
| Phase 2 | `AUTH-*` | 인증, 세션, 보호 경로 기반 구축 |
| Phase 3 | `ONB-*`, `REC-*`, `CONF-*`, `LLM-*`, `EVT-C01` ~ `EVT-C02` | 핵심 추천 경험 구현 |
| Phase 4 | `TRUST-*`, `PUSH-*`, `ARC-*`, `EVT-C03`, `EVT-Q01` | 신뢰 레이어, 푸시, 이력, 분석 완성 |
| Phase 5 | `TEST-*` | Acceptance Criteria 자동화 |
| Phase 6 | `PERF-*`, `SEC-*`, `MON-*`, `AVAIL-*`, `INFRA-004` | 성능, 보안, 운영 안정성 검증 |

