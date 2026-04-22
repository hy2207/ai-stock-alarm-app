---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-015: 제품 이벤트·설문 터치포인트 UX 맵"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-015] 제품 이벤트·설문 터치포인트 UX 맵
- 목적: PostHog 이벤트와 UX 설문이 실제 화면/행동에 정확히 매핑되도록 사용자 터치포인트를 설계한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — §1.2 North Star/KPI, EXP-02/05, BM-02/03/04
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — F7 REQ-FUNC-060~061, REQ-NF-040
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-015 / UI/UX Design / 복잡도 M

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] rec_card_view, rec_detail_view, price_copy, broker_redirect의 UI 발생 지점 정의
- [ ] confidence_view, confidence_change의 노출/조작 기준 정의
- [ ] reason_expand, performance_card_view의 행동 기준 정의
- [ ] push_open, deeplink_success, deeplink_fail의 사용자 흐름 기준 정의
- [ ] UX 설문 노출 조건: 상세 5초 이상 체류, 표본 수, frequency cap 제안
- [ ] `DTO-009`, `EVT-C03`, `MON-003`와 이벤트명/속성 정합성 확인

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 이벤트 위치 명확성
- Given: 개발자가 클라이언트 이벤트를 삽입해야 함
- When: UX-015를 참조함
- Then: 각 이벤트가 어떤 화면, 어떤 사용자 행동에서 발생해야 하는지 판단할 수 있다.

Scenario 2: 설문 터치포인트
- Given: Decision Confidence Score 또는 사용성 설문을 수집해야 함
- When: 설문 노출 조건을 검토함
- Then: 사용자 경험을 과도하게 방해하지 않는 조건과 위치가 정의되어 있다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-015는 이벤트/설문 터치포인트의 UX 위치 정의에 한정한다.
- PostHog SDK 초기화, 이벤트 schema, 대시보드 구현은 `DTO-009`, `EVT-*`, `MON-003`에서 수행한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 주요 제품 이벤트가 화면/행동과 매핑되었는가?
- [ ] 설문 노출 기준이 PRD 측정 조건과 맞는가?
- [ ] 이벤트 taxonomy와 충돌하지 않는가?

## :construction: Dependencies & Blockers
- Depends on: UX-007, UX-009, UX-011, UX-013, DTO-009
- Blocks: EVT-C03, MON-003, TEST-F7-01
