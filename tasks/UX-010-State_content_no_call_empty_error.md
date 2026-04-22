---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-010: No Call·loading·empty·error 상태 UX/콘텐츠 명세"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-010] No Call·loading·empty·error 상태 UX/콘텐츠 명세
- 목적: 데이터 부족, LLM 실패, 성과 부족, 인증/네트워크 오류 상황에서 사용자에게 5xx나 빈 화면 대신 이해 가능한 상태를 제공하도록 설계한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — REQ-FUNC-013, REQ-FUNC-042, REQ-FUNC-083
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — AC1-2, AC5-3, No Call 비율
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-010 / UI/UX Design / 복잡도 M

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] No Call 카드의 시각 상태와 사용자 안내 문구 정의
- [ ] LLM 실패, 데이터 부족, 시장 데이터 지연, 성과 기록 부족 상태를 구분
- [ ] "데이터 축적 중" 빈 상태의 위치와 표시 조건 정의
- [ ] loading/skeleton 사용 여부와 최대 노출 기준 정의
- [ ] 사용자에게 HTTP 5xx/기술 에러 원문을 노출하지 않는 오류 UX 기준 작성
- [ ] 재시도, 기다림, 설정 수정 등 사용 가능한 다음 행동을 상태별로 정리

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: No Call 상태
- Given: 데이터 부족 또는 LLM 실패로 추천 카드 생성이 불가능함
- When: 홈 또는 상세 화면이 렌더링됨
- Then: 빈 카드나 에러 페이지 대신 No Call 상태 카드 또는 대체 안내가 표시된다.

Scenario 2: 성과 부족 빈 상태
- Given: 신규 사용자 또는 신규 종목이라 성과 기록이 부족함
- When: 성과 카드 영역을 확인함
- Then: 빈 표 대신 "데이터 축적 중" 상태가 표시된다.

Scenario 3: 기술 오류 비노출
- Given: 외부 서비스 실패 또는 네트워크 오류가 발생함
- When: 사용자 화면을 확인함
- Then: 기술 오류 원문이나 5xx 화면이 직접 노출되지 않는다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-010은 상태별 UX와 콘텐츠 명세에 한정한다.
- 에러 핸들링 로직, 이벤트 발행, No Call 저장은 개발 태스크에서 구현한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] No Call/loading/empty/error 상태가 구분되어 있는가?
- [ ] 상태별 사용자 안내 문구와 다음 행동이 정의되었는가?
- [ ] `REC-Q04`, `TRUST-Q02`, `LLM-C06`에서 재사용 가능한가?

## :construction: Dependencies & Blockers
- Depends on: UX-007, UX-008, UX-014
- Blocks: REC-Q04, TRUST-Q02, LLM-C06, TEST-F2-01
