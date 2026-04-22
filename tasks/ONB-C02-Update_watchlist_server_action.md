---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] ONB-C02: 관심 종목/섹터 수정 Server Action 구현"
labels: 'feature, backend, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [ONB-C02] 관심 종목/섹터 수정 Server Action 구현
- 목적: 관심 종목/섹터 수정 Server Action 구현을(를) 통해 사용자의 관심 종목/섹터를 수집하고 추천 카드 생성 컨텍스트로 저장한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — §F1 REQ-FUNC-003
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — ONB-C02 / Onboarding / 복잡도 M
- API/Server Action 명세: [`/tasks/SRS-v1.md#61-api-endpoint--server-action-list`](./SRS-v1.md#61-api-endpoint--server-action-list)
- 제품/비즈니스 배경: [`/tasks/PRD_v1.md`](./PRD_v1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] SRS의 §F1 REQ-FUNC-003 요구사항과 ONB-C02 태스크 범위를 재확인
- [ ] 선행 태스크 상태 확인: ONB-C01
- [ ] 온보딩 Server Action 또는 화면 컴포넌트의 파일 위치와 공개 인터페이스 결정
- [ ] 관심 종목/섹터 수정 Server Action 구현의 Server Action 또는 화면 컴포넌트 작성
- [ ] 관심 종목/섹터 최소 1개, 최대 3개 제약 처리
- [ ] 인증 세션의 `userId` 기준으로 사용자 데이터 조회/저장
- [ ] 성공 시 홈 또는 설정 화면 재검증/revalidate 흐름 연결
- [ ] 정상/예외/빈 상태 입력을 모두 처리하는 검증 로직 또는 테스트 fixture 준비
- [ ] 관련 타입, export, import 경로를 정리하고 후속 태스크에서 재사용 가능하게 구성
- [ ] README 또는 주석이 필요한 운영/제약 사항을 최소한으로 문서화

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 정상 처리
- Given: 선행 태스크(ONB-C01)가 완료되어 있음
- When: 관심 종목/섹터 수정 Server Action 구현 작업을 실행함
- Then: SRS §F1 REQ-FUNC-003 요구사항을 만족하는 산출물이 생성되고 후속 태스크에서 참조할 수 있다.

Scenario 2: 오류 및 경계 조건 처리
- Given: 누락되거나 허용되지 않은 입력, 빈 데이터, 외부 서비스 실패 중 하나가 발생함
- When: 관심 종목/섹터 수정 Server Action 구현 로직 또는 검증을 실행함
- Then: 사용자에게 불필요한 5xx 오류를 노출하지 않고 명확한 검증 오류, 빈 상태, 또는 No Call/운영 경보 경로로 처리한다.

Scenario 3: 추적 이벤트 및 후속 연동
- Given: 관심 종목/섹터 수정 Server Action 구현 완료 후 관련 후속 태스크 또는 사용자 행동이 발생함
- When: 데이터 조회, 저장, 이벤트 발행, 화면 전환 중 필요한 연동을 수행함
- Then: 의존 태스크가 같은 계약을 재사용하고 PostHog/Prisma/외부 SaaS 연동이 누락되지 않는다.

## :gear: Technical & Non-Functional Constraints
- 범위: ONB-C02는 [Command] 관심 종목/섹터 수정 Server Action 구현 — 기존 watchlist 갱신, 변경 반영 확인에 한정하며 unrelated refactor를 포함하지 않는다.
- 의존성: ONB-C01 완료 상태를 전제로 한다.
- 보안: API 키, OAuth 토큰, 사용자 식별자, 원문 입력은 코드/로그에 평문으로 남기지 않는다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 모든 Acceptance Criteria를 충족하는가?
- [ ] 단위 테스트(Unit Test) 및 통합 테스트(Integration Test)가 추가되었고 통과하는가?
- [ ] SonarQube / Linter 등의 정적 분석 도구 경고가 없는가?
- [ ] API 명세서(Swagger 등)가 최신화되었는가?

## :construction: Dependencies & Blockers
- Depends on: ONB-C01
- Blocks: ONB-Q02
