# 서브에이전트 6개로 나눈 이유: 하나로 뭉쳐두지 않은 기준

Claude Code를 쓰면서 처음엔 서브에이전트 없이 메인 세션 하나로 전부 처리했다. 그런데 프로젝트가 커지면서 문제가 생겼다 — Prisma 스키마를 고치는 작업과 UI 컴포넌트를 고치는 작업이 같은 컨텍스트에 섞이니까, 에이전트가 가끔 "DB 스키마를 고치다 말고 갑자기 Tailwind 클래스를 손보는" 식으로 주제가 흐트러졌다. 그래서 역할별로 서브에이전트를 6개로 나눴다. 이번 편은 그 경계를 어떤 기준으로 그었는지에 대한 기록이다.

## 1. 먼저 없앤 것부터 — 스택과 안 맞는 에이전트는 삭제

이 저장소는 원래 스캐폴드에 Java/Spring, Gradle, JPA/QueryDSL, Redis/Kafka, Flutter 관련 에이전트가 남아있었다. 지금 스택(Next.js + Prisma + Vercel AI SDK)과 전혀 안 맞는 것들이었다. `CLAUDE.md`에 아예 이렇게 못박아뒀다.

> **이 저장소에서 제거됨 (잘못된 스택):** Java/Spring, Gradle, JPA/QueryDSL, Redis/Kafka, Flutter 에이전트 — 스택이 바뀌지 않는 한 재생성하지 않는다.

서브에이전트를 나누기 전에 먼저 한 일이 "안 쓸 것부터 지우기"였다는 게 의외로 중요했다. 남아있는 에이전트 파일은 검색될 때마다 후보로 잡히기 때문에, 안 맞는 게 섞여 있으면 엉뚱한 에이전트가 호출될 위험이 있다.

## 2. 경계를 그은 기준: REQ 카테고리 = 에이전트 경계

6개 에이전트를 나눈 기준은 파일 위치가 아니라 SRS의 요구사항 카테고리였다.

| 에이전트 | 담당 |
|---|---|
| `nextjs-decision-layer` | App Router 페이지/레이아웃, RSC 데이터 로드, 미들웨어, 라우팅 (C-TEC-001/002) |
| `prisma-data-layer` | 스키마, 마이그레이션, SQLite/Postgres 호환 쿼리 |
| `vercel-ai-gemini-cards` | `streamObject`, 카드 JSON 스키마, Zod 검증, 재시도, No Call |
| `posthog-onesignal-analytics` | 이벤트 택소노미, capture 헬퍼, cron/push 플로우 |
| `shadcn-ui-ux` | Tailwind + shadcn 컴포넌트, 신뢰도 UI, 카드 레이아웃, 접근성 |
| `document-updater` | 커밋 전 README / `docs/` / 하네스 규칙 동기화 |

이렇게 나누니 각 에이전트 프롬프트 안에 "이 도메인에서만 지켜야 할 하드 룰"을 명확하게 박아넣을 수 있었다. 예를 들어 `prisma-data-layer`에는 이런 문장이 들어있다.

> **Do not** reintroduce `EventLog` / `NotificationLog` Prisma models (analytics + push are external SaaS per SRS v0.3).

`posthog-onesignal-analytics`에는 이런 문장이 들어있다.

> **Never** add `POST /api/events` or Prisma-backed event logs for product telemetry (SRS REQ-FUNC-060).

같은 규칙(이벤트를 DB에 안 쌓고 PostHog로 위임한다)이 두 에이전트 양쪽에서 서로 다른 각도로 강제된다 — DB 담당자는 "테이블을 만들지 마라", 분석 담당자는 "엔드포인트를 만들지 마라"로. 하나의 에이전트에 다 몰아넣었으면 이렇게 양방향으로 못박기가 어려웠을 것이다.

[스크린샷 삽입 위치: `.claude/agents/` 폴더의 파일 목록 (6개 md 파일)을 GitHub에서 캡처 — https://github.com/hy2207/ai-stock-alarm-app/tree/main/.claude/agents ]

## 3. 툴 권한도 도메인에 맞춰 좁힌다

여섯 에이전트 모두 `tools: Read, Edit, Write, Grep, Glob, Bash`로 동일하게 시작하지만, 실제 차이는 프롬프트 안의 "무엇을 건드리면 안 되는지"에 있다. `shadcn-ui-ux`는 ADR-004(차트 배제)를 프롬프트에 그대로 인용해서, 상세 페이지 primary fold에 raw 차트 위젯을 넣으려는 시도 자체를 막는다.

> **Result-first cards:** direction, prices/ranges, hold days, reason line, trust snippet — no raw chart widgets in the primary fold of detail (ADR-004 / REQ-FUNC-014).

이 프롬프트가 없었으면 UI 에이전트가 "차트 있으면 더 좋지 않을까"라는 합리적인 제안을 그때그때 했을 거고, 매번 사람이 다시 ADR을 설명해야 했을 것이다.

## 4. `document-updater`를 별도로 둔 이유

여섯 개 중 유일하게 "기능 개발"이 아닌 에이전트가 `document-updater`다. 코드가 바뀌었는데 README나 `docs/`가 안 맞으면 문서가 조용히 썩는다. 그래서 커밋 전에 문서 드리프트가 의심될 때 이 에이전트를 따로 태우도록 `CLAUDE.md` §3에 명시했다. 다만 이 에이전트에도 브레이크가 있다 — PRD/SRS의 REQ ID 자체는 "사람과 조율 없이 조용히 재작성하지 않는다"고 못박아뒀다. 문서 동기화 자동화가 요구사항 자체를 슬쩍 바꿔버리는 걸 막기 위함이다.

## 5. 언제 서브에이전트를 안 쓰는가

`CLAUDE.md`에는 "가장 좁은 에이전트를 쓰되, 작은 수정은 메인 세션을 우선한다"는 규칙도 같이 넣어뒀다. 실제로 한두 줄짜리 오타 수정이나 문구 변경까지 서브에이전트로 위임하면, 컨텍스트 전환 비용이 작업량보다 커진다. 에이전트 분리는 "도메인 경계가 헷갈릴 만큼 작업이 커질 때"만 이득이 나는 구조라고 판단했다.

## 6. 정리

서브에이전트를 나눈 기준은 결국 "SRS 요구사항 카테고리 하나 = 에이전트 하나"였다. 이렇게 나누니 각 에이전트에 그 도메인에만 해당하는 하드 룰(ADR-004, No Call 처리, 이벤트 위임 등)을 구체적으로 박아넣을 수 있었고, 안 맞는 레거시 에이전트는 과감히 지워서 후보군을 깨끗하게 유지했다. 다음 편은 지금까지의 하네스/프로세스 얘기에서 벗어나, 실제로 알고리즘을 두 번 갈아엎은 회고다 — 처음 짠 통계 예측 모델이 왜 랜덤워크보다도 못한 성능이 나왔고, 그걸 어떻게 고쳤는지에 대한 이야기.
