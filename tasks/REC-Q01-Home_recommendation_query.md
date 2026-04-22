---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] REC-Q01: 홈 화면 Server Component"
labels: 'feature, backend, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [REC-Q01] 홈 화면 Server Component
- 목적: 홈 화면 Server Component을(를) 통해 사용자가 홈과 상세 화면에서 실행 가능한 추천 카드 정보를 오류 없이 확인하게 한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — §F2 REQ-FUNC-010, §3.4.1
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — REC-Q01 / Recommendation / 복잡도 M
- API/Server Action 명세: [`/tasks/SRS-v1.md#61-api-endpoint--server-action-list`](./SRS-v1.md#61-api-endpoint--server-action-list)
- 제품/비즈니스 배경: [`/tasks/PRD_v1.md`](./PRD_v1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] SRS의 §F2 REQ-FUNC-010, §3.4.1 요구사항과 REC-Q01 태스크 범위를 재확인
- [ ] 선행 태스크 상태 확인: DB-005, DTO-005, AUTH-C02
- [ ] 추천 카드 조회/표시/상호작용 기능의 파일 위치와 공개 인터페이스 결정
- [ ] 홈 화면 Server Component 조회/표시/상호작용 구현
- [ ] published 카드와 no_call 상태를 모두 오류 없이 처리
- [ ] ticker, direction, 가격, holdDays, confidenceScore, reasonLine 필수 표시 검증
- [ ] 투자 자문 오해 방지 면책 문구와 차트 비노출 제약 반영
- [ ] 정상/예외/빈 상태 입력을 모두 처리하는 검증 로직 또는 테스트 fixture 준비
- [ ] 관련 타입, export, import 경로를 정리하고 후속 태스크에서 재사용 가능하게 구성
- [ ] README 또는 주석이 필요한 운영/제약 사항을 최소한으로 문서화

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 정상 처리
- Given: 선행 태스크(DB-005, DTO-005, AUTH-C02)가 완료되어 있음
- When: 홈 화면 Server Component 작업을 실행함
- Then: SRS §F2 REQ-FUNC-010, §3.4.1 요구사항을 만족하는 산출물이 생성되고 후속 태스크에서 참조할 수 있다.

Scenario 2: 오류 및 경계 조건 처리
- Given: 누락되거나 허용되지 않은 입력, 빈 데이터, 외부 서비스 실패 중 하나가 발생함
- When: 홈 화면 Server Component 로직 또는 검증을 실행함
- Then: 사용자에게 불필요한 5xx 오류를 노출하지 않고 명확한 검증 오류, 빈 상태, 또는 No Call/운영 경보 경로로 처리한다.

Scenario 3: 추적 이벤트 및 후속 연동
- Given: 홈 화면 Server Component 완료 후 관련 후속 태스크 또는 사용자 행동이 발생함
- When: 데이터 조회, 저장, 이벤트 발행, 화면 전환 중 필요한 연동을 수행함
- Then: 의존 태스크가 같은 계약을 재사용하고 PostHog/Prisma/외부 SaaS 연동이 누락되지 않는다.

## :gear: Technical & Non-Functional Constraints
- 범위: REC-Q01는 [Query] 홈 화면 Server Component — Prisma에서 오늘 생성된 cached 카드 조회 로직 구현에 한정하며 unrelated refactor를 포함하지 않는다.
- 의존성: DB-005, DTO-005, AUTH-C02 완료 상태를 전제로 한다.
- 보안: API 키, OAuth 토큰, 사용자 식별자, 원문 입력은 코드/로그에 평문으로 남기지 않는다.
- 성능: 홈 추천 카드 조회는 warm 상태 p95 ≤ 800ms 목표를 고려한다.
- 컴플라이언스: 캔들/RSI/MACD 위젯은 메인 폴드에 노출하지 않고 면책 문구를 유지한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 모든 Acceptance Criteria를 충족하는가?
- [ ] 단위 테스트(Unit Test) 및 통합 테스트(Integration Test)가 추가되었고 통과하는가?
- [ ] SonarQube / Linter 등의 정적 분석 도구 경고가 없는가?
- [ ] API 명세서(Swagger 등)가 최신화되었는가?

## :construction: Dependencies & Blockers
- Depends on: DB-005, DTO-005, AUTH-C02
- Blocks: REC-Q03, PUSH-Q01, TEST-F2-01, PERF-001
