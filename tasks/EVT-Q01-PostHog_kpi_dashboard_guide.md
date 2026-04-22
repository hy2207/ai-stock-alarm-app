---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] EVT-Q01: PostHog 대시보드 이벤트 taxonomy/속성 스키마 적용 및 KPI 대시보드 구성 가이드 작성"
labels: 'feature, backend, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [EVT-Q01] PostHog 대시보드 이벤트 taxonomy/속성 스키마 적용 및 KPI 대시보드 구성 가이드 작성
- 목적: PostHog 대시보드 이벤트 taxonomy/속성 스키마 적용 및 KPI 대시보드 구성 가이드 작성을(를) 통해 핵심 사용자 행동과 운영 이벤트를 PostHog에서 일관되게 분석 가능하게 한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — §F7 REQ-FUNC-061, §4.2.5 REQ-NF-040
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — EVT-Q01 / Analytics / 복잡도 M
- 제품/비즈니스 배경: [`/tasks/PRD_v1.md`](./PRD_v1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] SRS의 §F7 REQ-FUNC-061, §4.2.5 REQ-NF-040 요구사항과 EVT-Q01 태스크 범위를 재확인
- [ ] 선행 태스크 상태 확인: DTO-009, EVT-C03
- [ ] PostHog 이벤트 taxonomy, SDK 연동, 대시보드의 파일 위치와 공개 인터페이스 결정
- [ ] PostHog 대시보드 이벤트 taxonomy/속성 스키마 적용 및 KPI 대시보드 구성 가이드 작성에 필요한 PostHog SDK/helper/taxonomy 구성
- [ ] 클라이언트 16종 및 서버 3종 이벤트명을 DTO-009 기준으로 정렬
- [ ] `/api/events` 엔드포인트를 새로 만들지 않는지 확인
- [ ] distinctId, userId, recId 등 공통 속성 누락을 방지
- [ ] 정상/예외/빈 상태 입력을 모두 처리하는 검증 로직 또는 테스트 fixture 준비
- [ ] 관련 타입, export, import 경로를 정리하고 후속 태스크에서 재사용 가능하게 구성
- [ ] README 또는 주석이 필요한 운영/제약 사항을 최소한으로 문서화

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 정상 처리
- Given: 선행 태스크(DTO-009, EVT-C03)가 완료되어 있음
- When: PostHog 대시보드 이벤트 taxonomy/속성 스키마 적용 및 KPI 대시보드 구성 가이드 작성 작업을 실행함
- Then: SRS §F7 REQ-FUNC-061, §4.2.5 REQ-NF-040 요구사항을 만족하는 산출물이 생성되고 후속 태스크에서 참조할 수 있다.

Scenario 2: 오류 및 경계 조건 처리
- Given: 누락되거나 허용되지 않은 입력, 빈 데이터, 외부 서비스 실패 중 하나가 발생함
- When: PostHog 대시보드 이벤트 taxonomy/속성 스키마 적용 및 KPI 대시보드 구성 가이드 작성 로직 또는 검증을 실행함
- Then: 사용자에게 불필요한 5xx 오류를 노출하지 않고 명확한 검증 오류, 빈 상태, 또는 No Call/운영 경보 경로로 처리한다.

Scenario 3: 추적 이벤트 및 후속 연동
- Given: PostHog 대시보드 이벤트 taxonomy/속성 스키마 적용 및 KPI 대시보드 구성 가이드 작성 완료 후 관련 후속 태스크 또는 사용자 행동이 발생함
- When: 데이터 조회, 저장, 이벤트 발행, 화면 전환 중 필요한 연동을 수행함
- Then: 의존 태스크가 같은 계약을 재사용하고 PostHog/Prisma/외부 SaaS 연동이 누락되지 않는다.

## :gear: Technical & Non-Functional Constraints
- 범위: EVT-Q01는 [Query] PostHog 대시보드 이벤트 taxonomy/속성 스키마 적용 및 KPI 대시보드 구성 가이드 작성 — ADR, CTR, Confidence Engagement Rate, D7/D30 Retention에 한정하며 unrelated refactor를 포함하지 않는다.
- 의존성: DTO-009, EVT-C03 완료 상태를 전제로 한다.
- 보안: API 키, OAuth 토큰, 사용자 식별자, 원문 입력은 코드/로그에 평문으로 남기지 않는다.
- 데이터 품질: 이벤트 누락률 < 1% 목표를 고려한다.
- 아키텍처: `/api/events` 엔드포인트를 구현하지 않고 PostHog SDK/helper를 사용한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 모든 Acceptance Criteria를 충족하는가?
- [ ] 단위 테스트(Unit Test) 및 통합 테스트(Integration Test)가 추가되었고 통과하는가?
- [ ] SonarQube / Linter 등의 정적 분석 도구 경고가 없는가?
- [ ] API 명세서(Swagger 등)가 최신화되었는가?

## :construction: Dependencies & Blockers
- Depends on: DTO-009, EVT-C03
- Blocks: MON-003
