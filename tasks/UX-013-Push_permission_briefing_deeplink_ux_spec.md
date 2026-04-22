---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-013: 푸시 권한·아침 브리핑·딥링크 UX 명세"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-013] 푸시 권한·아침 브리핑·딥링크 UX 명세
- 목적: 푸시 권한 요청, 아침 브리핑 알림 문구, 푸시 탭 후 홈/상세 랜딩 및 실패 fallback을 사용자 경험 관점에서 설계한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — F6 REQ-FUNC-050~052, REQ-NF-004
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — Story 6, 푸시 운영 모니터링
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-013 / UI/UX Design / 복잡도 M

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 푸시 권한 요청 전 사전 안내와 consentPush 토글 UX 정의
- [ ] 권한 허용/거부/회수 상태별 화면 피드백 정의
- [ ] 아침 브리핑 알림 title/body/deeplink 문구 기준 작성
- [ ] 푸시 탭 후 홈 또는 추천 상세 랜딩 흐름 정의
- [ ] 딥링크 실패 시 fallback 화면과 안내 문구 정의
- [ ] push_open, deeplink_success, deeplink_fail 이벤트 위치를 `UX-015`와 연결

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 권한 요청 이해 가능성
- Given: 사용자가 푸시 수신 설정을 보거나 권한 요청을 받음
- When: 권한 허용 여부를 결정함
- Then: 수신 목적과 거부/회수 가능성이 명확하게 안내된다.

Scenario 2: 딥링크 랜딩
- Given: 사용자가 아침 브리핑 푸시를 탭함
- When: 앱 또는 웹으로 진입함
- Then: 홈 또는 지정 상세 화면으로 이동하고 실패 시 fallback이 제공된다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-013은 푸시 권한, 알림 카피, 딥링크 랜딩 UX 명세에 한정한다.
- OneSignal SDK, Cron, 딥링크 라우팅 구현은 `PUSH-C01`~`PUSH-Q01`에서 수행한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 권한 허용/거부/회수 상태가 정의되었는가?
- [ ] 알림 문구와 딥링크 fallback이 명확한가?
- [ ] 이벤트 터치포인트가 누락되지 않았는가?

## :construction: Dependencies & Blockers
- Depends on: UX-002, UX-007, UX-014
- Blocks: PUSH-C01, PUSH-Q01
