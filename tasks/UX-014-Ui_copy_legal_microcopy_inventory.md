---
name: UI/UX Design Task
about: SRS/PRD 기반의 UI/UX 디자인 태스크 명세
title: "[Design] UX-014: UI 카피·법적 면책·마이크로카피 인벤토리"
labels: 'design, ui/ux, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [UX-014] UI 카피·법적 면책·마이크로카피 인벤토리
- 목적: 투자 참고용 면책, 선택 제한, No Call, 데이터 축적 중, 인증/개인정보 등 사용자-facing 문구를 일관되게 정의한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — REQ-FUNC-002, REQ-FUNC-013, REQ-FUNC-042, REQ-FUNC-085, Legal
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — ADR-004/005, risk & legal notes
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-014 / UI/UX Design / 복잡도 M

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 카드 하단 고정 면책 문구 정의: 투자 참고용 정보이며 투자 자문이 아님
- [ ] 최대 3개 선택 제한, 0개 선택, 저장 완료/실패 문구 정의
- [ ] No Call, 데이터 부족, LLM 실패, 데이터 축적 중 상태 문구 정의
- [ ] 로그인 필요, 세션 만료, 푸시 권한 요청/거부 문구 정의
- [ ] 성공/실패 성과 공개 시 신뢰를 해치지 않는 톤앤매너 기준 작성
- [ ] 개발자가 hardcode하지 않고 재사용할 수 있는 copy key 제안

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 필수 면책 문구
- Given: 추천 카드가 표시됨
- When: 사용자가 카드 하단을 확인함
- Then: 투자 자문이 아님을 알리는 면책 문구가 일관되게 제공된다.

Scenario 2: 상태별 마이크로카피
- Given: 온보딩 제한, No Call, 성과 부족, 인증 필요, 푸시 권한 상태가 발생함
- When: 각 화면 상태가 표시됨
- Then: 사용자에게 다음 행동을 알려주는 문구가 정의되어 있다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-014는 사용자-facing 카피와 법적 면책 문구 인벤토리에 한정한다.
- 법무 최종 검토가 필요한 문구는 별도 표시한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 필수 법적 면책 문구가 포함되었는가?
- [ ] 주요 상태별 문구가 누락 없이 정리되었는가?
- [ ] 후속 UX/프론트엔드 태스크가 같은 카피를 재사용할 수 있는가?

## :construction: Dependencies & Blockers
- Depends on: UX-001
- Blocks: UX-006, UX-007, UX-010, UX-013, AUTH-Q01, REC-Q03
