---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-005: 로그인·세션 UX 명세"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-005] 로그인·세션 UX 명세
- 목적: OAuth/이메일 로그인, 보호 경로 진입, 세션 만료 상황에서 사용자가 다음 행동을 명확히 이해하도록 인증 UX를 설계한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — F10 REQ-FUNC-090~092
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-005 / UI/UX Design / 복잡도 L

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 로그인 화면의 OAuth/이메일 CTA 우선순위와 안내 문구 정의
- [ ] 미인증 사용자가 보호 경로 접근 시 `/login`으로 이동하는 UX 문구 정의
- [ ] 세션 만료/갱신 실패/재로그인 유도 상태의 표시 방식 정의
- [ ] 개인정보·인증 토큰 관련 불필요한 정보 노출 금지 기준 작성
- [ ] `AUTH-Q01`, `AUTH-C02`, `AUTH-C03` 구현자가 참조할 화면 상태를 정리

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 로그인 선택지 명확성
- Given: 사용자가 로그인 화면에 진입함
- When: 로그인 옵션을 확인함
- Then: Google/Kakao 또는 이메일 로그인 경로가 명확한 CTA로 표현된다.

Scenario 2: 보호 경로 fallback
- Given: 미인증 또는 세션 만료 사용자가 홈/상세/설정에 접근함
- When: 로그인 화면으로 이동함
- Then: 왜 로그인이 필요한지와 다음 행동이 명확하게 안내된다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-005는 인증 관련 화면 상태와 문구 설계에 한정한다.
- NextAuth.js 설정, middleware, JWT 처리는 개발 태스크에서 수행한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 로그인/미인증/세션 만료 상태가 모두 정의되었는가?
- [ ] 보안상 민감 정보 노출 금지 기준이 포함되었는가?
- [ ] `AUTH-Q01`에서 바로 구현 가능한 수준의 상태 명세인가?

## :construction: Dependencies & Blockers
- Depends on: UX-002, UX-003
- Blocks: AUTH-Q01
