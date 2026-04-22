---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] MOCK-001: 프론트엔드 UI 개발용 추천 카드 Mock 데이터 생성"
labels: 'feature, backend, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [MOCK-001] 프론트엔드 UI 개발용 추천 카드 Mock 데이터 생성
- 목적: 프론트엔드 UI 개발용 추천 카드 Mock 데이터 생성을(를) 고정 fixture로 제공하여 백엔드 구현 전에도 UI, 테스트, 스토리북 검증이 가능하게 한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — §F2, §6.2.4
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — MOCK-001 / Foundation / 복잡도 L
- 제품/비즈니스 배경: [`/tasks/PRD_v1.md`](./PRD_v1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] SRS의 §F2, §6.2.4 요구사항과 MOCK-001 태스크 범위를 재확인
- [ ] 선행 태스크 상태 확인: DTO-003
- [ ] UI/테스트용 mock 데이터 fixture의 파일 위치와 공개 인터페이스 결정
- [ ] 프론트엔드 UI 개발용 추천 카드 Mock 데이터 생성에 필요한 정상/경계/빈 상태 mock 데이터 정의
- [ ] mock 데이터가 실제 DTO/Zod 스키마를 통과하는지 검증
- [ ] UI 개발자가 import 가능한 fixture 경로 제공
- [ ] 외부 API mock은 rate limit, timeout, 결측 응답 케이스를 포함
- [ ] 정상/예외/빈 상태 입력을 모두 처리하는 검증 로직 또는 테스트 fixture 준비
- [ ] 관련 타입, export, import 경로를 정리하고 후속 태스크에서 재사용 가능하게 구성
- [ ] README 또는 주석이 필요한 운영/제약 사항을 최소한으로 문서화

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 정상 mock fixture 사용
- Given: UI 개발자가 프론트엔드 UI 개발용 추천 카드 Mock 데이터 생성 fixture를 import함
- When: 관련 컴포넌트 또는 테스트를 렌더링함
- Then: 실제 API 없이도 정상 상태 화면과 상호작용을 검증할 수 있다.

Scenario 2: 빈 상태와 실패 상태 검증
- Given: 빈 배열, No Call, 외부 API 실패, 평가 전 상태 등 경계 fixture가 준비됨
- When: UI 또는 테스트가 해당 fixture를 사용함
- Then: 런타임 오류 없이 빈 상태/안내 문구/실패 처리가 확인된다.

Scenario 3: 스키마 정합성
- Given: DTO/Zod 스키마가 존재함
- When: mock 데이터를 schema로 검증함
- Then: 모든 fixture가 계약을 통과하거나 의도된 실패 fixture로 명시된다.

## :gear: Technical & Non-Functional Constraints
- 범위: MOCK-001는 프론트엔드 UI 개발용 추천 카드 Mock 데이터 생성 — 정상 카드 3벌(aggressive/balanced/conservative) + No Call 카드 1개에 한정하며 unrelated refactor를 포함하지 않는다.
- 의존성: DTO-003 완료 상태를 전제로 한다.
- 보안: API 키, OAuth 토큰, 사용자 식별자, 원문 입력은 코드/로그에 평문으로 남기지 않는다.
- 결정성: mock 데이터는 테스트 반복 실행 시 동일한 결과를 반환해야 한다.
- 현실성: SRS 필수 필드, 빈 상태, 실패 상태를 모두 포함한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 모든 Acceptance Criteria를 충족하는가?
- [ ] 단위 테스트(Unit Test) 및 통합 테스트(Integration Test)가 추가되었고 통과하는가?
- [ ] SonarQube / Linter 등의 정적 분석 도구 경고가 없는가?
- [ ] API 명세서(Swagger 등)가 최신화되었는가?

## :construction: Dependencies & Blockers
- Depends on: DTO-003
- Blocks: REC-Q03, CONF-Q01
