---
name: generate-tasks-from-srs
description: 소프트웨어 요구사항 명세서(SRS)를 분석하여 개발 태스크(Task)를 추출하고 이슈 템플릿 형태로 분해하는 워크플로우 명령어입니다.
disable-model-invocation: true
---
## 📝 개발 Task 에 대한 가장 간결한 Issue 템플릿 구조

```markdown
### Summary
- 기능명: [FR-001 회원가입]

### Description
- SRS 참조: `docs/SRS-v1.md` (REQ-FUNC-xxx / REQ-NF-xxx 섹션)
- 시퀀스: `docs/SRS-v1.md` §3.4 (mermaid 시퀀스)
- 데이터모델: `docs/SRS-v1.md` §6.2 (Prisma 엔터티)

### Acceptance Criteria (GWT)
- Given: 이메일, 비밀번호 입력
- When: 회원가입 요청
- Then: 계정 생성 성공, 중복 이메일 예외 발생 시 409 반환

### Non-Functional Constraints
- 응답시간 p95 ≤ 300ms
- 에러율 ≤ 0.5%

### Labels
- `feature`, `backend`, `priority:high`
```

## 📌 SRS → 개발 Task 체크리스트

| 단계 | 해야 할 일 | 결과물 |
| --- | --- | --- |
| 1 | 모든 요구사항 ID 정리 | REQ 리스트 |
| 2 | 각 요구사항을 입력/처리/출력/예외로 분해 | Task Tree (태스크 간의 선-후행, 참조 관계 등) |
| 3 | 각 요구사항의 AC를 DoD(Definition of Done)로 변환 | Task 완료 조건 |
| 4 | 인터페이스(API·Server Action) 기준 작업 단위를 상세 구현 단위로 분해 | Next.js Route Handler / Server Action / RSC 데이터 로더 / Zod 스키마 |
| 5 | 데이터 모델을 스키마·Migration으로 변환 | DDL/Migration |
| 6 | NFR(성능/보안/운영)을 Test 목표 및 운영관리 시 정기 점검 수행 가능하도록 개발할 Task로 변환 | Load test, Security, Monitoring 관련 개발 Task 및 운영 지침서 |

---

## 📘 **SRS → 개발 Task 추출의 핵심 원리 3가지**

### **1) SRS의 구조(Functional / Non-Functional / Interface / Data)가 Task의 구조**

- Functional → **모듈 개발 Task**
- Non-Functional → **성능·보안·테스트·모니터링 Task**
- Interface(Endpoints) → **API 설계/DTO/Validator/Swagger Task**
- Data Model → **DB Schema / Migration / Entity Mapping Task**

### **2) SRS 요구사항 1개는 개발 Task 여러 개가 될 수 있음**

SRS는 “테스트 가능하고 모호하지 않은 요구사항” 단위,

SRS에 정의된 요구사항이 큰 개발목표 단위로 묘사되어 있다면, 개발 Task는 “구현 단위(코드·설정·배포·문서화)”로 쪼개야 함.

> ex) REQ-FUNC-001 하나에서
      → Backend 여러개, Frontend 여러개, Infra 여러개 Task로 바뀌는 것은 정상

### **3) Acceptance Criteria(AC)는 Task의 “완료 조건(Definition of Done)”**

AC1, AC2, AC3이 있으면 → 각 항목이 **다른 개발 작업** 또는 **테스트 작업**으로 분리되어야 함.

---

## 🧩 **SRS → 개발 Task 추출 절차(6단계)**

### **1단계. SRS의 REQ 목록을 수집**

| Requirement ID | Title | Type |
| --- | --- | --- |
| REQ-FUNC-010 | 기관 템플릿 선택 UI | Functional |
| REQ-FUNC-011 | 자동작성 엔진 | Functional |
| REQ-FUNC-012 | Validator 실행 | Functional |
| REQ-NF-001 | Validator 응답 ≤ 800ms | 성능 |
| REQ-NF-004 | TLS 1.2+, RBAC, 감사 로그 1년 | 보안 |

### **2단계. 각 REQ의 “행위(Behavior)”를 기준으로 Sub-Task를 분해**

- REQ to Sub-Task 분해 원칙(분해 결과 항목):
    - 입력(Input)
    - 처리(Process)
    - 출력(Output)
    - 예외(Exception)
    - 설정(Configuration)
    - 테스트(Test)
- 예시) REQ-FUNC-011: “문서 자동작성 엔진” Task 분해 예:
    
    | Sub-Task | 설명 |
    | --- | --- |
    | 입력 스키마 정의 | 템플릿·질문지·답변 구조 설계 |
    | 자동작성 알고리즘 설계 | Prompt, 룰셋, 스키마 기반 엔진 |
    | Generated 문서 구조 정의 | Document 엔터티 mapping |
    | 예외 처리 | 누락/형식 오류 시 재작성 플로우 |
    | 유닛 테스트 | 규칙 테스트 |
    | 통합 테스트 | Validator 연계 테스트 |
    | 부하 테스트 | p95 ≤ 4s 검증 |

### **3단계. “Acceptance Criteria”를 Task의 완료 조건으로 변환**

각 AC 항목이 Task 완료 체크박스가 됨

- 예시
    - 스토리에 대한 AC 리스트
        ```markdown
        Story 1 AC:
        - p95 ≤1.0s
        - 필드 자동채움 85%↑
        - Validator 오류 0
        - 누락/형식 오류 하이라이트 표시
        ```
        
    - Task: Validator 기능 개발(Done 조건, “측정 가능한 완성 정의”)
        ```markdown
        - [ ]  필수 필드 자동 채움율 ≥ 85%
        - [ ]  Validator 응답속도 p95 ≤ 1.0s
        - [ ]  누락/형식 오류 표시 1s 이내
        - [ ]  재검사 시 형식 오류 0건
        ```

---

### **4단계. SRS §3.3 / Appendix 6.1 — Route Handler·Server Action → 구현 Task로 변환**

- SRS에 정의된 **`/api/...` Route Handler**, **`saveRiskProfile` 등 Server Action**, **RSC에서의 Prisma 직접 조회** 각각을 다음으로 분해한다:

    | Task | 예 (본 프로젝트) |
    | --- | --- |
    | 라우트/액션 시그니처 정의 | `app/api/recommendations/today/route.ts`, `saveWatchlist()` |
    | Zod 입력/출력 스키마 | `SaveWatchlistInput`, `RecommendationCardSchema` |
    | 서버 로직 | Prisma 쿼리, 캐시(`revalidate`/`unstable_cache`), LLM `streamObject()` 오케스트레이션 |
    | 인증/권한 | NextAuth 세션, `CRON_SECRET`, 미들웨어 보호 경로 |
    | 에러/No Call 처리 | HTTP 5xx 금지, No Call 카드, `llm_call_failed` 등 서버 이벤트 |
    | 클라이언트 연동 | `posthog-js` capture, 가격 복사/브로커 리다이렉트 UX |
    | 테스트 | Route/Action 단위 테스트, 스키마 검증 테스트, E2E(핵심 플로우) |

---

### **5단계. 데이터 모델 → DB 생성 작업으로 변환**

SRS Appendix(Data Model) 기준으로 자동 생성 작업 가능한 DB 상세 요건 도출:

- 예: SRS 에 데이터 모델이 “Document(id, template_version, validator_score…)” 와 같이 정의된 경우, 다음과 같은 구체적인 데이터베이스 객체 및
    - 테이블 생성
    - 인덱스 생성
    - FK/제약조건 설계
    - DB migration 스크립트 작성
    - Prisma 모델 및 `prisma generate`
    - 테스트 데이터 생성 스크립트

---

### **6단계. 성능·보안·운영 NFR을 DevOps/QA Task로 변환**

- 예시) REQ-NF-001 홈 추천 p95 ≤ 800ms (warm)
    
    ```markdown
    성능 테스트 Task:
    - Vercel / Playwright 또는 k6로 `/api/recommendations/today` p95 측정
    - LLM 경로는 streamObject로 TTFB 단축 검증
    
    보안 Task:
    - NextAuth 세션·OAuth 스코프 최소화
    - Vercel 환경 변수·Supabase RLS 정책 점검
    - TLS(플랫폼 기본) 및 시크릿 미기록 린트
    
    운영 Task:
    - PostHog 대시보드(ADR, CTR 등) + Vercel 로그 알림
    - `/api/admin/health` 데이터 freshness 알림
    - Gemini/OneSignal 비용 모니터링 (REQ-NF-030~031)
    ```

    ---
    ### 📦 각 단계별 결과물 추출 경로 예시

    | 단계 | 추출 산출물 | 예시 추출/저장 경로 |
    | ---- | -------------------- | ------------------------------- |
    | 1단계 | 요구사항 목록(REQ) | `/srs/req-list.md` |
    | 2단계 | Task Tree             | `/tasks/task-tree.json` |
    | 3단계 | DoD/AC Mapping        | `/tasks/acceptance-criteria.md` |
    | 4단계 | API·Server Action·Zod 설계 | `app/api/**`, `app/actions/**`, `lib/schemas/**` |
    | 5단계 | Prisma 스키마/마이그레이션 | `prisma/schema.prisma`, `prisma/migrations/` |
    | 6단계 | 테스트/운영 Task         | `tests/`, PostHog·Vercel 대시보드 설정 메모 `docs/` 또는 `tasks/` |

    > 각 작업의 산출물은 위와 같은 형태로 각 폴더 및 파일로 정리/추출되어 실 개발 및 협업 시 추적 가능해야 합니다.