# [UX-016] 디자인 QA·사용성 테스트 핸드오프 체크리스트 — 차트 비노출, 면책 고정, 시각 회귀, 접근성, SUS/과업 완료율 기준

- Issue: #112
- State: OPEN
- URL: https://github.com/hy2207/ai-stock-alarm-app/issues/112
- Author: hy2207
- Created: 2026-05-14T12:22:08Z
- Updated: 2026-05-14T12:41:42Z
- Closed: Not closed
- Labels: task, phase/P-1-UX
- Assignees: None
- Milestone: None

## Body

## Metadata
- **Task ID:** `UX-016`
- **Epic:** UI/UX Design
- **SRS / PRD:** PRD EXP-02/05, BM-02/03/04, SRS REQ-FUNC-014
- **Complexity:** M
- **Start Date:** 2026-05-18
- **Target Date:** 2026-05-20
- **AI-accelerated effort:** ~0.6d

## Spec (local)
Source: `tasks/UX-016-Design_qa_usability_handoff_checklist.md`

## :dart: Summary
- 기능명: [UX-016] 디자인 QA·사용성 테스트 핸드오프 체크리스트
- 목적: 차트 비노출, 면책 고정, 접근성, 반응형, 시각 회귀, 사용성 테스트 기준을 개발/QA가 검증 가능한 체크리스트로 만든다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- PRD 문서: [`/tasks/PRD_v1.md`](./PRD_v1.md) — EXP-02, EXP-05, BM-02/03/04
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — REQ-FUNC-014, REQ-NF-003/005
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — UX-016 / UI/UX Design / 복잡도 M

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] 메인 폴드 차트/RSI/MACD 비노출 검증 항목 작성
- [ ] 카드 하단 면책 문구 고정 검증 항목 작성
- [ ] Confidence Score 3단계 조작 가능성 및 300ms 체감 검증 항목 작성
- [ ] No Call, 데이터 축적 중, 로그인 필요, 푸시 권한 상태의 시각 QA 항목 작성
- [ ] 모바일/데스크톱 viewport별 반응형 체크리스트 작성
- [ ] 접근성 체크리스트: keyboard, focus, label, contrast, touch target
- [ ] 사용성 테스트 지표: 과업 완료율 80% 이상, SUS 75 이상, 난이도 개선 기준 연결

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 디자인 QA 실행 가능성
- Given: 프론트엔드 구현이 완료됨
- When: QA 담당자가 UX-016 체크리스트를 실행함
- Then: 차트 비노출, 면책 고정, 상태 표시, 반응형, 접근성 항목을 검증할 수 있다.

Scenario 2: 사용성 테스트 연결
- Given: EXP-05 또는 BM-02/03 검증을 수행함
- When: 테스트 기준을 확인함
- Then: 과업 완료율, SUS, 난이도 기준이 PRD 목표와 연결되어 있다.

## :gear: Technical & Non-Functional Constraints
- 범위: UX-016은 디자인 QA와 사용성 테스트 핸드오프 체크리스트에 한정한다.
- 자동화 테스트 구현은 `TEST-*`, `PERF-*`, 프론트엔드 E2E 태스크에서 수행한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] SRS/PRD의 필수 UX 검증 항목이 누락 없이 포함되었는가?
- [ ] 수동 QA와 자동화 테스트 모두에서 참조 가능한가?
- [ ] `REC-Q05`, `TEST-F4-02`, `TEST-F6-02` 등 후속 검증 태스크와 연결되는가?

## :construction: Dependencies & Blockers
- Depends on: UX-004, UX-010, UX-014, UX-015
- Blocks: REC-Q05, TEST-F4-02, TEST-F6-02

---
Refs: `tasks/task-list-v1.md`, `tasks/gantt-from-task-list-v1.md`, `docs/SRS-v1.md`
