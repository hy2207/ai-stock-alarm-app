---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-003: 디자인 시스템 기초 정의"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-003] 디자인 시스템 기초 정의
- 목적: Tailwind CSS와 shadcn/ui 기반으로 구현 가능한 디자인 토큰, 컴포넌트 사용 원칙, 상태 스타일을 정의한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — C-TEC-004, §3.1 Client Layer, Glossary `shadcn/ui`
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — ADR-004, ADR-005
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-003 / UI/UX Design / 복잡도 M

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 컬러, 타이포그래피, spacing, radius, elevation, border token 기준 정의
- [ ] shadcn/ui 컴포넌트 사용 후보(Button, Card, Table, Tabs/Segmented Control, Alert 등) 지정
- [ ] success/failure/No Call/loading/disabled/focus/selected 상태 스타일 정의
- [ ] 추천 카드, 성과 카드, 토글, 표, CTA의 공통 디자인 패턴 정리
- [ ] Tailwind class 구현 시 재사용 가능한 token naming과 금지 스타일을 명시

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 구현 가능한 디자인 기준
- Given: Next.js, Tailwind CSS, shadcn/ui 사용 제약이 있음
- When: 디자인 시스템 기초를 정의함
- Then: 프론트엔드 개발자가 별도 시각 추측 없이 공통 스타일을 구현할 수 있다.

Scenario 2: 상태 스타일 포함
- Given: 추천 카드에는 정상, No Call, loading, disabled, selected 등 다양한 상태가 있음
- When: 컴포넌트 스타일 기준을 검토함
- Then: 주요 상태별 시각 기준과 접근성 고려가 누락되지 않는다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-003은 디자인 시스템 원칙과 token/component 기준 정의에 한정한다.
- 실제 컴포넌트 구현은 `INFRA-001`, `REC-Q03`, `CONF-Q01` 등 개발 태스크에서 수행한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] Tailwind/shadcn 기반 구현 기준이 명시되었는가?
- [ ] 상태별 스타일과 접근성 고려가 포함되었는가?
- [ ] 화면별 UX 명세가 재사용할 공통 패턴이 정리되었는가?

## :construction: Dependencies & Blockers
- Depends on: UX-001
- Blocks: UX-004, UX-005, UX-006, UX-007, UX-012
