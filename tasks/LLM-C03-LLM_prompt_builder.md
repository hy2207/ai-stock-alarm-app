---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] LLM-C03: LLM 프롬프트 구성 모듈"
labels: 'feature, backend, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [LLM-C03] LLM 프롬프트 구성 모듈
- 목적: LLM 프롬프트 구성 모듈을(를) 통해 시장 데이터와 사용자 컨텍스트를 기반으로 구조화된 추천 카드를 생성한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — §F9 REQ-FUNC-082, REQ-FUNC-085
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — LLM-C03 / LLM Pipeline / 복잡도 H
- LLM 생성/검증 요구사항: [`/tasks/SRS-v1.md#f9-llm-기반-추천-카드-생성`](./SRS-v1.md#f9-llm-기반-추천-카드-생성)
- 제품/비즈니스 배경: [`/tasks/PRD_v1.md`](./PRD_v1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] SRS의 §F9 REQ-FUNC-082, REQ-FUNC-085 요구사항과 LLM-C03 태스크 범위를 재확인
- [ ] 선행 태스크 상태 확인: LLM-C01, LLM-C02, DTO-004
- [ ] Vercel AI SDK 기반 추천 생성 파이프라인의 파일 위치와 공개 인터페이스 결정
- [ ] LLM 프롬프트 구성 모듈 모듈 구현
- [ ] watchlist, OHLCV, 뉴스 시그널, risk_mode 컨텍스트 조합
- [ ] Vercel AI SDK `streamObject()`와 Zod 검증 경계 연결
- [ ] 실패 시 No Call 저장 및 server-side PostHog 이벤트 발행 경로 마련
- [ ] 정상/예외/빈 상태 입력을 모두 처리하는 검증 로직 또는 테스트 fixture 준비
- [ ] 관련 타입, export, import 경로를 정리하고 후속 태스크에서 재사용 가능하게 구성
- [ ] README 또는 주석이 필요한 운영/제약 사항을 최소한으로 문서화

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: 정상 처리
- Given: 선행 태스크(LLM-C01, LLM-C02, DTO-004)가 완료되어 있음
- When: LLM 프롬프트 구성 모듈 작업을 실행함
- Then: SRS §F9 REQ-FUNC-082, REQ-FUNC-085 요구사항을 만족하는 산출물이 생성되고 후속 태스크에서 참조할 수 있다.

Scenario 2: 오류 및 경계 조건 처리
- Given: 누락되거나 허용되지 않은 입력, 빈 데이터, 외부 서비스 실패 중 하나가 발생함
- When: LLM 프롬프트 구성 모듈 로직 또는 검증을 실행함
- Then: 사용자에게 불필요한 5xx 오류를 노출하지 않고 명확한 검증 오류, 빈 상태, 또는 No Call/운영 경보 경로로 처리한다.

Scenario 3: 추적 이벤트 및 후속 연동
- Given: LLM 프롬프트 구성 모듈 완료 후 관련 후속 태스크 또는 사용자 행동이 발생함
- When: 데이터 조회, 저장, 이벤트 발행, 화면 전환 중 필요한 연동을 수행함
- Then: 의존 태스크가 같은 계약을 재사용하고 PostHog/Prisma/외부 SaaS 연동이 누락되지 않는다.

## :gear: Technical & Non-Functional Constraints
- 범위: LLM-C03는 [Command] LLM 프롬프트 구성 모듈 — watchlist, OHLCV 요약, 뉴스 시그널, risk_mode 4종 컨텍스트 조합, 3벌 카드(aggressive/balanced/conservative) 동시 생성 지시, 면책 조항 포함에 한정하며 unrelated refactor를 포함하지 않는다.
- 의존성: LLM-C01, LLM-C02, DTO-004 완료 상태를 전제로 한다.
- 보안: API 키, OAuth 토큰, 사용자 식별자, 원문 입력은 코드/로그에 평문으로 남기지 않는다.
- 런타임: Serverless Function timeout 내 동작하며 `streamObject()` 첫 응답 10초 이내 시작을 목표로 한다.
- 비용: 추천 카드 생성 단가와 월 사용자당 AI 추론비 목표를 고려한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 모든 Acceptance Criteria를 충족하는가?
- [ ] 단위 테스트(Unit Test) 및 통합 테스트(Integration Test)가 추가되었고 통과하는가?
- [ ] SonarQube / Linter 등의 정적 분석 도구 경고가 없는가?
- [ ] API 명세서(Swagger 등)가 최신화되었는가?

## :construction: Dependencies & Blockers
- Depends on: LLM-C01, LLM-C02, DTO-004
- Blocks: LLM-C04
