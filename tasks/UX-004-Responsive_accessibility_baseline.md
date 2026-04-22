---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-004: 반응형·접근성 기준 정의"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-004] 반응형·접근성 기준 정의
- 목적: PC/모바일 브라우저에서 핵심 투자 판단 정보를 읽고 조작할 수 있도록 반응형 레이아웃과 접근성 기준을 정의한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — §3.1 Web App/Mobile Web, REQ-NF-005, C-TEC-004
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — §5.1 품질 요구사항, BM-02/03
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-004 / UI/UX Design / 복잡도 M

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 모바일/태블릿/데스크톱 주요 viewport 기준 정의
- [ ] 추천 카드, 토글, CTA, 성과 카드, 이력 표의 반응형 재배치 규칙 작성
- [ ] 키보드 조작, focus ring, aria label, screen reader text 기준 정의
- [ ] 색 대비, 터치 타깃, 오류 메시지 가시성 기준 명시
- [ ] 디자인 QA에서 검증할 viewport/accessibility 체크리스트로 연결

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 반응형 기준 명확화
- Given: 제품은 PC/모바일 브라우저에서 동일 Next.js 앱으로 제공됨
- When: 화면별 레이아웃 기준을 정의함
- Then: 핵심 정보와 CTA가 모바일과 데스크톱에서 모두 누락 없이 표시된다.

Scenario 2: 접근성 기준 포함
- Given: 사용자가 키보드와 보조 기술로 주요 기능을 사용할 수 있어야 함
- When: 접근성 기준을 검토함
- Then: focus, label, contrast, touch target 기준이 명시된다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-004는 반응형/접근성 디자인 기준 정의에 한정한다.
- 접근성 자동 테스트 구현은 별도 테스트/프론트엔드 태스크에서 수행한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 주요 화면과 컴포넌트의 반응형 규칙이 정리되었는가?
- [ ] 키보드/focus/label/contrast 기준이 포함되었는가?
- [ ] `UX-016` 디자인 QA에서 검증 가능한 항목으로 표현되었는가?

## :construction: Dependencies & Blockers
- Depends on: UX-002, UX-003
- Blocks: UX-016
