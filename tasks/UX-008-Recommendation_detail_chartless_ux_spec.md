---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-008: 추천 상세·차트 없는 결과 해석 UX 명세"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-008] 추천 상세·차트 없는 결과 해석 UX 명세
- 목적: 추천 상세 화면에서도 메인 폴드에 캔들/RSI/MACD를 노출하지 않고, 결과와 근거 중심으로 판단할 수 있는 정보 구조를 설계한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — REQ-FUNC-012, REQ-FUNC-014, F5
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — Story 2, ADR-004
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-008 / UI/UX Design / 복잡도 M

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 추천 상세 화면의 first fold 정보 구성 정의
- [ ] 캔들 차트, RSI, MACD 등 원본 차트 위젯 비노출 기준 명문화
- [ ] 홈 카드에서 상세로 이동할 때 유지되어야 할 정보와 추가 정보 구분
- [ ] 이유, 성과 카드, 유사 패턴 섹션의 배치 우선순위 정의
- [ ] 상세 화면 p95 렌더링 목표를 해치지 않는 정보량 기준 정리

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 차트 없는 상세 화면
- Given: 사용자가 추천 상세 화면에 진입함
- When: 메인 폴드 영역을 확인함
- Then: 캔들 차트, RSI, MACD 위젯이 노출되지 않고 결과 중심 정보가 먼저 표시된다.

Scenario 2: 홈 카드와 상세의 연속성
- Given: 사용자가 홈 추천 카드에서 상세로 이동함
- When: 상세 화면을 확인함
- Then: 홈 카드의 핵심 정보가 유지되고 상세 근거/성과 정보가 자연스럽게 추가된다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-008은 추천 상세 화면의 정보 구조와 차트 비노출 UX 기준 정의에 한정한다.
- 실제 Server Component/Client Component 구현은 `REC-Q02`, `REC-Q05`, `TRUST-Q02`에서 수행한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 메인 폴드 차트 비노출 기준이 검증 가능하게 정의되었는가?
- [ ] 상세 화면의 정보 위계가 홈 카드와 연결되는가?
- [ ] `REC-Q05` 디자인 QA 태스크에서 검증할 기준이 포함되었는가?

## :construction: Dependencies & Blockers
- Depends on: UX-007
- Blocks: REC-Q05, TRUST-Q02, TRUST-Q04
