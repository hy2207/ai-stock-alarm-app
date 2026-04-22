---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-009: Confidence Score 선택 인터랙션 명세"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-009] Confidence Score 선택 인터랙션 명세
- 목적: aggressive/balanced/conservative 선택형 UX를 단순 배지가 아닌 직접 조작 가능한 리스크 선택 인터페이스로 설계한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — F4 REQ-FUNC-030~033, REQ-NF-003, CON-002
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — Story 4, ADR-002, EXP-02
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-009 / UI/UX Design / 복잡도 H

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 3단계 선택 UI 형태 정의: segmented control, tabs 또는 동등한 조작 가능한 패턴
- [ ] aggressive/balanced/conservative 라벨, 설명, 선택 상태, focus 상태 정의
- [ ] 선택 변경 시 price, holdDays, actionLabel 중 변경값을 사용자가 인지하는 피드백 설계
- [ ] 300ms 이하 전환 체감을 위한 loading 미노출/즉시 반응 UX 기준 정의
- [ ] 저장된 riskMode 복원 시 기본 선택 상태와 재진입 경험 정의
- [ ] `confidence_view`, `confidence_change` 이벤트 터치포인트를 `UX-015`와 정합성 있게 연결

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 직접 선택 가능한 UX
- Given: 사용자가 추천 카드 화면에 진입함
- When: Confidence Score 영역을 확인함
- Then: aggressive, balanced, conservative 3가지 옵션이 조작 가능한 선택 UI로 표시된다.

Scenario 2: 변경 피드백
- Given: 사용자가 Confidence Score를 변경함
- When: 카드 출력값이 갱신됨
- Then: 변경된 값이 300ms 이하 체감으로 반영되고 선택 상태가 명확히 표시된다.

Scenario 3: 단순 배지 금지
- Given: 설계 검토자가 Confidence Score UI를 검토함
- When: 인터랙션 명세를 확인함
- Then: Confidence Score를 읽기 전용 badge로 구현하는 설계가 배제된다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-009는 Confidence Score 인터랙션과 상태 UX 정의에 한정한다.
- LLM 재호출 없이 3벌 카드 전환을 구현하는 로직은 `CONF-Q01`, `LLM-C03`, `LLM-C04`에서 수행한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 3단계 옵션과 상태별 UI가 정의되었는가?
- [ ] 300ms 전환 체감과 변경 피드백 기준이 포함되었는가?
- [ ] ADR-002/CON-002 위반 설계를 막을 수 있는가?

## :construction: Dependencies & Blockers
- Depends on: UX-007
- Blocks: CONF-Q01, TEST-F4-02
