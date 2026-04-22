---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-007: 홈 추천 카드 UX 명세"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-007] 홈 추천 카드 UX 명세
- 목적: 차트 없이 방향·가격·보유기간·Confidence·한 줄 이유를 한 장의 카드에서 이해하고 행동할 수 있게 정보 위계와 CTA를 설계한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — F2/F3, REQ-FUNC-010~023, REQ-FUNC-085
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — Story 1, Story 2, ADR-001/004
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-007 / UI/UX Design / 복잡도 H

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 추천 카드의 핵심 정보 우선순위 정의: ticker, direction, entry/target price, holdDays, confidenceScore, reasonLine
- [ ] 단일가와 가격 범위 표시 방식 및 가격 copy UX 정의
- [ ] broker_redirect CTA의 위치, 라벨, 외부 이동 안내 정의
- [ ] 카드 하단 고정 면책 문구 표시 위치와 위계 정의
- [ ] 카드 1~3개 노출 시 grid/stack 레이아웃과 모바일 우선 배치 정의
- [ ] No Call 카드와 정상 카드의 시각적 차이를 `UX-010`과 정합성 있게 연결

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 결과 중심 정보 위계
- Given: 추천 카드 데이터가 렌더링됨
- When: 사용자가 홈 화면을 확인함
- Then: 방향, 가격, 보유기간, Confidence Score, 한 줄 이유를 차트 없이 이해할 수 있다.

Scenario 2: 행동 CTA 명확성
- Given: 사용자가 추천 카드에서 실행 행동을 고민함
- When: 가격 복사 또는 브로커 이동 CTA를 확인함
- Then: CTA의 목적과 결과가 명확하게 표현된다.

Scenario 3: 법적 면책 노출
- Given: 추천 카드가 정상 또는 No Call 상태로 표시됨
- When: 사용자가 카드를 확인함
- Then: "투자 참고용 정보이며 투자 자문이 아님" 취지의 면책 문구가 카드 하단에 고정된다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-007은 홈 추천 카드의 UX/시각/카피 명세에 한정한다.
- 실제 카드 컴포넌트 구현과 이벤트 발행은 `REC-Q03`, `REC-C01`, `REC-C02`에서 수행한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 정상 카드 1~3개와 모바일/데스크톱 배치 기준이 정의되었는가?
- [ ] 가격 복사/브로커 이동 CTA와 이벤트 터치포인트가 설계되었는가?
- [ ] 면책 문구와 차트 비노출 원칙이 반영되었는가?

## :construction: Dependencies & Blockers
- Depends on: UX-002, UX-003, UX-014, MOCK-001
- Blocks: UX-008, UX-009, UX-010, UX-013, REC-Q03, REC-C01, REC-C02
