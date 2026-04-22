---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-002: 핵심 사용자 여정 및 IA/화면 목록 정의"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-002] 핵심 사용자 여정 및 IA/화면 목록 정의
- 목적: 로그인부터 온보딩, 홈 추천, 상세, 설정, 이력, 푸시 딥링크까지 제품 화면 구조와 이동 흐름을 개발 전 기준으로 고정한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — §3 User Stories, §4.1 Feature Scope
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — §3.4 핵심 시퀀스, F1/F2/F4/F5/F6/F8/F10
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-002 / UI/UX Design / 복잡도 M

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 신규 사용자와 재방문 사용자의 end-to-end journey를 분리 정의
- [ ] Login, Onboarding, Home, Recommendation Detail, Settings, Archive, Push Landing 화면 목록 작성
- [ ] 각 화면의 진입 조건, 종료 조건, 보호 경로 여부, 빈 상태를 표로 정리
- [ ] 홈/상세/설정/이력 간 내비게이션 구조와 back/fallback 흐름 정의
- [ ] 개발 태스크 `AUTH-Q01`, `ONB-Q01`, `REC-Q03`, `PUSH-Q01`, `ARC-Q02`가 참조할 화면 ID를 부여

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 화면 목록 완전성
- Given: SRS의 기능 범위 F1~F10이 확인됨
- When: IA와 화면 목록을 작성함
- Then: 로그인, 온보딩, 홈, 상세, 설정, 이력, 푸시 랜딩, 빈/오류 상태가 누락되지 않는다.

Scenario 2: 이동 흐름 명확성
- Given: 사용자가 보호 경로, 딥링크, 설정, 이력을 오갈 수 있음
- When: 사용자 여정이 검토됨
- Then: 각 경로의 진입/복귀/fallback 조건이 개발자가 구현 가능한 수준으로 명시된다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-002는 정보 구조, 화면 목록, 이동 흐름 정의에 한정한다.
- 세부 UI 컴포넌트 스타일은 `UX-003`, 화면별 상세 명세는 `UX-005`~`UX-013`에서 다룬다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 모든 v1.0 화면과 상태가 식별되었는가?
- [ ] 화면 ID와 후속 개발 태스크 연결이 명확한가?
- [ ] 딥링크와 미인증 접근 fallback이 포함되었는가?

## :construction: Dependencies & Blockers
- Depends on: UX-001
- Blocks: UX-004, UX-005, UX-006, UX-007, UX-012, UX-013
