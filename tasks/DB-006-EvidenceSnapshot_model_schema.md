---
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[Feature] DB-006: EvidenceSnapshot 모델 스키마 작성"
labels: 'feature, backend, priority:high'
assignees: ''
---

## :dart: Summary
- 기능명: [DB-006] EvidenceSnapshot 모델 스키마 작성
- 목적: EvidenceSnapshot 모델 스키마 작성을(를) Prisma 기반 SSOT 데이터 모델로 정의하여 후속 API, Server Action, LLM 파이프라인의 저장 구조를 안정화한다.

## :link: References (Spec & Context)
> :bulb: AI Agent & Dev Note: 작업 시작 전 아래 문서를 반드시 먼저 Read/Evaluate 할 것.
- SRS 문서: [`/tasks/SRS-v1.md`](./SRS-v1.md) — §6.2.5 EvidenceSnapshot
- 태스크 목록: [`/tasks/task-list-v1.md`](./task-list-v1.md) — DB-006 / Foundation / 복잡도 L
- 데이터 모델 (Prisma 호환): [`/tasks/SRS-v1.md#62-entity--data-model-prisma-호환`](./SRS-v1.md#62-entity--data-model-prisma-호환)
- 제품/비즈니스 배경: [`/tasks/PRD_v1.md`](./PRD_v1.md)

## :white_check_mark: Task Breakdown (실행 계획)
- [ ] SRS의 §6.2.5 EvidenceSnapshot 요구사항과 DB-006 태스크 범위를 재확인
- [ ] 선행 태스크 상태 확인: DB-005
- [ ] Prisma schema 및 마이그레이션 대상 모델의 파일 위치와 공개 인터페이스 결정
- [ ] Prisma 모델/관계/인덱스를 EvidenceSnapshot 모델 스키마 작성 요구사항에 맞게 작성
- [ ] SQLite와 Supabase PostgreSQL 호환성을 깨는 DB 전용 기능 사용 여부 검토
- [ ] enum성 값은 DB enum 대신 String + Zod 검증 경계로 유지
- [ ] `prisma validate` 및 Prisma Client 타입 생성 가능 여부 확인
- [ ] 정상/예외/빈 상태 입력을 모두 처리하는 검증 로직 또는 테스트 fixture 준비
- [ ] 관련 타입, export, import 경로를 정리하고 후속 태스크에서 재사용 가능하게 구성
- [ ] README 또는 주석이 필요한 운영/제약 사항을 최소한으로 문서화

## :test_tube: Acceptance Criteria (BDD/GWT)
Scenario 1: Prisma 스키마 정상 검증
- Given: 선행 태스크(DB-005)가 완료되어 있음
- When: `prisma validate` 또는 동등한 스키마 검증을 실행함
- Then: EvidenceSnapshot 모델 스키마 작성 관련 모델, 필드, 관계, 인덱스가 오류 없이 검증된다.

Scenario 2: 관계 기반 조회 가능
- Given: EvidenceSnapshot 모델 스키마 작성와 연결된 상위/하위 엔터티 fixture가 존재함
- When: Prisma Client로 관계 포함 조회를 실행함
- Then: SRS 데이터 모델에 정의된 필드가 누락 없이 반환된다.

Scenario 3: SQLite/PostgreSQL 호환성 유지
- Given: 로컬 SQLite와 Supabase PostgreSQL을 모두 고려해야 함
- When: 모델 타입과 제약을 검토함
- Then: DB 전용 enum/check constraint 없이 String/Zod 및 Prisma 표준 타입으로 호환성을 유지한다.

## :gear: Technical & Non-Functional Constraints
- 범위: DB-006는 `EvidenceSnapshot` 모델 스키마 작성 — recId(FK), newsSignalScore, volumeSignalScore, communitySignalScore, patternTag에 한정하며 unrelated refactor를 포함하지 않는다.
- 의존성: DB-005 완료 상태를 전제로 한다.
- 보안: API 키, OAuth 토큰, 사용자 식별자, 원문 입력은 코드/로그에 평문으로 남기지 않는다.
- 호환성: Prisma schema는 SQLite 로컬과 Supabase PostgreSQL 배포 환경을 모두 고려한다.
- 유지보수성: DB enum 대신 String + Zod 검증을 사용하고 Prisma Migrate 이력 관리가 가능해야 한다.

## :checkered_flag: Definition of Done (DoD)
- [ ] 모든 Acceptance Criteria를 충족하는가?
- [ ] 단위 테스트(Unit Test) 및 통합 테스트(Integration Test)가 추가되었고 통과하는가?
- [ ] SonarQube / Linter 등의 정적 분석 도구 경고가 없는가?
- [ ] API 명세서(Swagger 등)가 최신화되었는가?

## :construction: Dependencies & Blockers
- Depends on: DB-005
- Blocks: DTO-006, REC-Q02, LLM-C08
