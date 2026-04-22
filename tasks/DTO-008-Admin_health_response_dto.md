---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] DTO-008: /api/admin/health 응답 DTO 정의"
labels: 'feature, backend, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [DTO-008] /api/admin/health 응답 DTO 정의
- 목적: /api/admin/health 응답 DTO 정의을(를) Zod 기반 계약으로 정의하여 서버 입력, API 응답, LLM 출력, 클라이언트 렌더링 간 데이터 무결성을 보장한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — §6.1, REQ-NF-042
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — DTO-008 / Foundation / 복잡도 L
- API/Server Action 명세: [`/tasks/SRS-v1.md#61-api-endpoint--server-action-list`](./SRS-v1.md#61-api-endpoint--server-action-list)
- 제품/비즈니스 배경: [`/tasks/PRD_v1.md`](./PRD_v1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] SRS의 §6.1, REQ-NF-042 요구사항과 DTO-008 태스크 범위를 재확인
- [ ] 선행 태스크 상태 확인: 선행 태스크 없음
- [ ] Zod DTO/schema 및 TypeScript 타입의 파일 위치와 공개 인터페이스 결정
- [ ] /api/admin/health 응답 DTO 정의에 필요한 Zod object/enum/refine 규칙 정의
- [ ] `z.infer` 기반 TypeScript 타입 export
- [ ] 성공/실패 parse 사례를 단위 테스트 또는 fixture로 고정
- [ ] LLM/API/UI가 같은 스키마를 재사용하도록 경계 정리
- [ ] 정상/예외/빈 상태 입력을 모두 처리하는 검증 로직 또는 테스트 fixture 준비
- [ ] 관련 타입, export, import 경로를 정리하고 후속 태스크에서 재사용 가능하게 구성
- [ ] README 또는 주석이 필요한 운영/제약 사항을 최소한으로 문서화

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 유효 입력 파싱 성공
- Given: SRS가 정의한 필수 필드와 타입을 만족하는 payload가 주어짐
- When: /api/admin/health 응답 DTO 정의 Zod schema로 parse함
- Then: 타입이 보존된 결과가 반환되고 TypeScript 타입으로 재사용 가능하다.

Scenario 2: 유효하지 않은 입력 거부
- Given: 필수 필드 누락, 허용되지 않은 enum 값, 범위 밖 숫자, 공백 문자열 중 하나가 포함됨
- When: schema parse를 실행함
- Then: 저장 또는 응답 이전에 Zod 오류가 반환되고 기존 데이터는 변경되지 않는다.

Scenario 3: 후속 모듈 재사용
- Given: API/Server Action/LLM/UI가 같은 계약을 사용함
- When: 각 모듈에서 schema와 inferred type을 import함
- Then: 중복 타입 정의 없이 동일한 검증 규칙이 적용된다.

## :gear: Technical & Non-Functional Constraints
- 범위: DTO-008는 `/api/admin/health` 응답 DTO 정의 — `{ freshness, nullRate }`에 한정하며 unrelated refactor를 포함하지 않는다.
- 의존성: 독립 실행 가능해야 한다.
- 보안: API 키, OAuth 토큰, 사용자 식별자, 원문 입력은 코드/로그에 평문으로 남기지 않는다.
- 데이터 무결성: 모든 입력/출력 경계는 Zod parse 또는 safeParse로 검증한다.
- 타입 안정성: `z.infer` 타입을 export하여 중복 타입 선언을 피한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 모든 Acceptance Criteria를 충족하는가?
- [ ] 단위 테스트(Unit Test) 및 통합 테스트(Integration Test)가 추가되었고 통과하는가?
- [ ] SonarQube / Linter 등의 정적 분석 도구 경고가 없는가?
- [ ] API 명세서(Swagger 등)가 최신화되었는가?

## :construction: Dependencies & Blockers
- Depends on: None
- Blocks: MON-001
