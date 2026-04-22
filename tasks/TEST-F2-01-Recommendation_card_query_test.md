---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] TEST-F2-01: 추천 카드 조회 GWT 단위 테스트"
labels: 'feature, backend, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [TEST-F2-01] 추천 카드 조회 GWT 단위 테스트
- 목적: 추천 카드 조회 GWT 단위 테스트을(를) 통해 SRS Acceptance Criteria를 회귀 가능한 자동화 테스트로 고정한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — §F2 REQ-FUNC-010~013 AC
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — TEST-F2-01 / Test / 복잡도 M
- Traceability Matrix: [`/tasks/SRS-v1.md#5-traceability-matrix`](./SRS-v1.md#5-traceability-matrix)
- 제품/비즈니스 배경: [`/tasks/PRD_v1.md`](./PRD_v1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] SRS의 §F2 REQ-FUNC-010~013 AC 요구사항과 TEST-F2-01 태스크 범위를 재확인
- [ ] 선행 태스크 상태 확인: REC-Q01, REC-Q04
- [ ] 자동화 테스트 코드 및 fixture의 파일 위치와 공개 인터페이스 결정
- [ ] 추천 카드 조회 GWT 단위 테스트에 해당하는 Given/When/Then 테스트 케이스 작성
- [ ] 성공, 실패, 경계값, 빈 상태 fixture 준비
- [ ] 외부 서비스 호출은 mock/stub으로 대체
- [ ] 테스트 실패 메시지가 SRS 요구사항 위반 지점을 직접 설명하도록 작성
- [ ] 정상/예외/빈 상태 입력을 모두 처리하는 검증 로직 또는 테스트 fixture 준비
- [ ] 관련 타입, export, import 경로를 정리하고 후속 태스크에서 재사용 가능하게 구성
- [ ] README 또는 주석이 필요한 운영/제약 사항을 최소한으로 문서화

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 테스트가 요구사항 위반을 탐지
- Given: 추천 카드 조회 GWT 단위 테스트 대상 구현에 의도적으로 잘못된 입력 또는 실패 mock이 주어짐
- When: 자동화 테스트를 실행함
- Then: SRS 요구사항 위반 지점이 명확한 실패 메시지로 보고된다.

Scenario 2: 정상 경로 통과
- Given: SRS Acceptance Criteria를 만족하는 구현과 fixture가 준비됨
- When: 테스트 스위트를 실행함
- Then: Given/When/Then 케이스가 모두 통과한다.

Scenario 3: 외부 의존성 격리
- Given: Gemini, Yahoo Finance/Finnhub, OneSignal, PostHog 등 외부 서비스가 필요함
- When: 테스트를 실행함
- Then: 네트워크 호출 없이 mock/stub으로 결정적인 결과를 검증한다.

## :gear: Technical & Non-Functional Constraints
- 범위: TEST-F2-01는 [Test] 추천 카드 조회 GWT 단위 테스트 — 카드 ≤3개 반환, ticker/direction/confidenceScore 100% non-null, No Call 시 HTTP 200 + 안내문구에 한정하며 unrelated refactor를 포함하지 않는다.
- 의존성: REC-Q01, REC-Q04 완료 상태를 전제로 한다.
- 보안: API 키, OAuth 토큰, 사용자 식별자, 원문 입력은 코드/로그에 평문으로 남기지 않는다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 모든 Acceptance Criteria를 충족하는가?
- [ ] 단위 테스트(Unit Test) 및 통합 테스트(Integration Test)가 추가되었고 통과하는가?
- [ ] SonarQube / Linter 등의 정적 분석 도구 경고가 없는가?
- [ ] API 명세서(Swagger 등)가 최신화되었는가?

## :construction: Dependencies & Blockers
- Depends on: REC-Q01, REC-Q04
- Blocks: None identified in `task-list-v1.md`
