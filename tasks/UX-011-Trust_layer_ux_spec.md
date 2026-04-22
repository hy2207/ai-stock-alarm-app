---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-011: Trust Layer UX 명세"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-011] Trust Layer UX 명세
- 목적: 한 줄 이유, 성과 카드, 실패 포함 이력, 유사 패턴을 통해 AI 결과가 블랙박스처럼 느껴지지 않도록 신뢰 레이어를 설계한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — F5 REQ-FUNC-040~043
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — ADR-005, Story 5, BM-04
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-011 / UI/UX Design / 복잡도 M

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] reasonLine 표시, 확장, 160자 이하 제약을 고려한 UI 패턴 정의
- [ ] 성과 카드의 성공률, 실패율, 수익률 정보 위계 정의
- [ ] 실패 기록을 숨기지 않고 신뢰 요소로 표현하는 카피/시각 기준 작성
- [ ] 성과 기록 부족 시 "데이터 축적 중" 표시 방식 정의
- [ ] 유사 패턴 섹션의 존재 시 표시, 미존재 시 조용한 숨김 기준 정의
- [ ] `reason_expand`, `performance_card_view` 이벤트 터치포인트를 `UX-015`와 연결

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 이유 설명
- Given: 추천 카드 또는 상세 화면에 reasonLine이 있음
- When: 사용자가 이유 영역을 확인함
- Then: 한 줄 이유가 명확히 표시되고 필요 시 확장 동작이 정의된다.

Scenario 2: 실패 포함 성과 공개
- Given: 성과 기록에 성공과 실패가 모두 존재함
- When: 사용자가 성과 카드 영역을 확인함
- Then: 성공/실패 결과가 모두 신뢰 레이어로 표현된다.

Scenario 3: 데이터 부족 처리
- Given: 성과 기록이 부족함
- When: 성과 카드가 렌더링됨
- Then: UI 오류 없이 "데이터 축적 중" 상태가 표시된다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-011은 Trust Layer 화면/상태/카피 명세에 한정한다.
- 성과 기록 조회와 컴포넌트 구현은 `TRUST-Q01`~`TRUST-Q04`에서 수행한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] reasonLine, 성과 카드, 유사 패턴 상태가 모두 정의되었는가?
- [ ] 실패 기록 포함 원칙이 명확한가?
- [ ] 관련 이벤트 터치포인트가 누락되지 않았는가?

## :construction: Dependencies & Blockers
- Depends on: UX-008, UX-010, MOCK-002
- Blocks: TRUST-Q02, TRUST-Q03, TRUST-Q04
