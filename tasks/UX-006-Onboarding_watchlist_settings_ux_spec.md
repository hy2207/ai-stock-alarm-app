---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-006: 온보딩·관심 종목 설정 UX 명세"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-006] 온보딩·관심 종목 설정 UX 명세
- 목적: 관심 종목/섹터 최소 1개, 최대 3개 선택 및 이후 수정 흐름을 사용자에게 명확하게 제공하는 UX를 설계한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — F1 REQ-FUNC-001~003
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — §4.1 Must 관심 종목/섹터 온보딩
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-006 / UI/UX Design / 복잡도 M

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 신규 온보딩 화면의 선택 UI 구조와 진행 CTA 정의
- [ ] ticker/sector 선택 방식, 선택됨/해제됨/비활성 상태 정의
- [ ] 3개 초과 선택 시 "최대 3개까지 선택 가능합니다" 안내 위치와 톤 정의
- [ ] 0개 선택 상태에서 진행 차단 및 오류 문구 정의
- [ ] 설정 화면에서 기존 watchlist 수정 흐름과 저장 완료 피드백 정의

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 신규 선택 흐름
- Given: 신규 사용자가 온보딩 화면에 진입함
- When: 관심 종목 또는 섹터를 1개 이상 선택함
- Then: 다음 단계 또는 홈 이동 CTA가 명확하게 활성화된다.

Scenario 2: 선택 제한 안내
- Given: 사용자가 이미 3개를 선택함
- When: 추가 선택을 시도함
- Then: 선택이 차단되고 최대 3개 제한 안내가 즉시 표시된다.

Scenario 3: 설정 수정 흐름
- Given: 기존 watchlist가 있는 사용자가 설정 화면에 진입함
- When: 항목을 수정하고 저장함
- Then: 변경 완료 피드백과 다음 추천 반영 안내가 표시된다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-006은 온보딩/설정 UX 명세에 한정한다.
- Server Action, Zod 검증, Prisma 저장은 `ONB-C01`, `ONB-C02`에서 구현한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 최소/최대 선택 상태와 오류 문구가 모두 정의되었는가?
- [ ] 설정 화면 수정 UX가 온보딩 UX와 일관되는가?
- [ ] `ONB-Q01`, `ONB-Q02`의 선행 디자인 입력으로 충분한가?

## :construction: Dependencies & Blockers
- Depends on: UX-002, UX-003, UX-014
- Blocks: ONB-Q01, ONB-Q02
