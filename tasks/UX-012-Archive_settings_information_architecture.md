---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-012: 추천 이력 아카이브·설정 정보 구조 UX 명세"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-012] 추천 이력 아카이브·설정 정보 구조 UX 명세
- 목적: 종목별 과거 추천 결과와 관심 종목 설정을 사용자가 찾고 수정할 수 있도록 이력/설정 화면의 정보 구조를 정의한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — F8 REQ-FUNC-070, F1 REQ-FUNC-003
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — §4.1 Should 추천 이력 아카이브
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-012 / UI/UX Design / 복잡도 L

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 추천 이력 목록의 필드 우선순위 정의: ticker, predictedDirection, realizedReturn, hitFlag, evaluatedAt
- [ ] 종목별 필터/그룹핑/정렬 기준 정의
- [ ] 성공/실패 표기와 수익률 표시 방식 정의
- [ ] 이력 빈 상태와 신규 사용자 안내 문구 정의
- [ ] 설정 화면으로 이동해 관심 종목을 수정하는 진입 경로 정의

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 이력 목록 이해 가능성
- Given: 사용자가 특정 ticker의 추천 이력을 조회함
- When: 이력 목록을 확인함
- Then: 성공/실패, 수익률, 최신순 정보가 명확히 표시된다.

Scenario 2: 빈 상태
- Given: 추천 이력이 없는 사용자 또는 종목임
- When: 아카이브 화면을 확인함
- Then: 빈 목록이 오류처럼 보이지 않고 다음 행동이 안내된다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-012는 이력/설정 정보 구조와 화면 상태 설계에 한정한다.
- Prisma 조회와 실제 목록 구현은 `ARC-Q01`, `ARC-Q02`, `ONB-Q02`에서 수행한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 이력 목록 필드와 정렬 기준이 정의되었는가?
- [ ] 성공/실패와 수익률 표현 기준이 명확한가?
- [ ] 설정 화면 진입 경로와 watchlist 수정 흐름이 연결되는가?

## :construction: Dependencies & Blockers
- Depends on: UX-002, UX-003
- Blocks: ARC-Q02, ONB-Q02
