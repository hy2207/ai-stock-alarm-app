---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-001: 제품 UX 원칙·페르소나·JTBD 정리"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-001] 제품 UX 원칙·페르소나·JTBD 정리
- 목적: 준경험 투자자와 불신형 유료 독자의 핵심 문제를 기준으로, 이후 화면 설계가 따라야 할 제품 UX 원칙을 고정한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — §1, §2, ADR-001/004/005
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — §2.1 Stakeholders, CON-002/004, ASS-004
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-001 / UI/UX Design / 복잡도 M

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] PRD의 문제 정의, 성공 지표, 비전 원칙, ADR을 재확인
- [ ] 준경험 투자자와 불신형 유료 독자의 JTBD, pain, 성공 기준을 정리
- [ ] "차트 없는 결과 중심 UI", "리스크 직접 선택", "성과 공개형 Trust Layer"를 UX 원칙으로 명문화
- [ ] 차트/지표 중심 UI, Confidence 단순 배지화, 실패 이력 은폐 등 금지 설계 기준 정리
- [ ] 후속 UX 태스크가 참조할 decision note 형식으로 산출물 구조 정의

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 페르소나와 JTBD 고정
- Given: PRD/SRS의 사용자 문제와 ADR이 확인됨
- When: UX 원칙 문서를 작성함
- Then: 두 핵심 사용자군의 pain, goal, UX success criteria가 누락 없이 정리된다.

Scenario 2: 제품 원칙과 금지 기준 명확화
- Given: 차트 없는 결과 중심 UI와 Trust Layer가 v1.0의 핵심 방향임
- When: 후속 화면 설계자가 UX-001을 참조함
- Then: 메인 폴드 차트 노출, Confidence 단순 배지화, 실패 기록 은폐가 금지됨을 판단할 수 있다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-001은 제품 UX 원칙, 페르소나, JTBD, 설계 금지 기준 정의에 한정한다.
- 개발 구현, DB/API 설계, 인프라 구성은 포함하지 않는다.
- 산출물은 `UX-002`~`UX-016`에서 직접 참조 가능해야 한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 페르소나/JTBD/UX 원칙이 PRD/SRS 근거와 연결되어 있는가?
- [ ] 후속 디자인·개발 태스크가 판단 기준으로 사용할 수 있는가?
- [ ] ADR-002/004/005와 충돌하는 설계를 명확히 배제했는가?

## :construction: Dependencies & Blockers
- Depends on: None
- Blocks: UX-002, UX-003, UX-014
