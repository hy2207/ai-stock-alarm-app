# SRS 한 줄이 커밋 20개가 되기까지: 요구사항을 태스크로 쪼개는 스킬

SRS를 다 쓰고 나면 그다음 문제는 "이걸 누가 Task로 쪼개느냐"였다. REQ-FUNC-001 하나를 통째로 에이전트에게 던지면, 커밋 하나에 백엔드/프론트/테스트가 뒤섞여서 리뷰가 불가능한 크기로 나온다. 그래서 SRS를 태스크로 분해하는 절차 자체를 스킬(`generate-tasks-from-srs`)로 만들어 반복 가능하게 했다.

## 1. 요구사항 하나 = 태스크 여러 개라는 전제

이 스킬의 핵심 전제는 이거다 — SRS는 "테스트 가능하고 모호하지 않은 요구사항" 단위로 쓰여 있지만, 개발 태스크는 "구현 단위(코드·설정·배포·문서화)"로 쪼개야 한다. 요구사항 1개가 백엔드 여러 개, 프론트 여러 개, 인프라 여러 개 태스크로 갈라지는 게 정상이라고 아예 문서에 못박아뒀다.

분해 기준은 입력(Input) / 처리(Process) / 출력(Output) / 예외(Exception) / 설정(Configuration) / 테스트(Test) 여섯 갈래다.

## 2. AC가 그대로 완료 조건(DoD)이 된다

2편에서 SRS의 AC를 Given/When/Then으로 쓴다고 했는데, 이 AC가 태스크 단계에서는 체크박스로 그대로 옮겨진다.

```markdown
- [ ] 필수 필드 자동 채움율 ≥ 85%
- [ ] Validator 응답속도 p95 ≤ 1.0s
- [ ] 누락/형식 오류 표시 1초 이내
```

AC 따로, DoD 따로 새로 쓰는 게 아니라 그냥 AC를 체크박스 문장으로 바꾸기만 하면 된다. 이 부분이 스킬을 만들면서 가장 시간을 아낀 지점이다 — "완료 조건을 뭘로 잡지"라는 고민 자체가 사라진다.

## 3. 실제로 어떻게 쪼개졌는지 — RecommendationCard 사례

말로만 하면 추상적이니 실제 커밋 로그를 그대로 가져와본다. `RecommendationCard` 관련 REQ 하나가 실제로 이렇게 쪼개져서 들어갔다.

```
7b27d7a feat(db): User model Zod validation schema and tests
078d802 feat(db): RiskProfile model Zod validation schema and tests
81ad09b feat(db): Watchlist model Zod validation schema and tests
b8c7bfb feat(db): RecommendationCard model Zod validation schema and tests
3a78200 feat(db): EvidenceSnapshot & PerformanceRecord Zod validation schemas and tests
026ba8e feat(db): Prisma initial migration for all 9 models
48a0452 feat(db): NextAuth.js compatible models (Account, Session, VerificationToken)
d5d4c0e feat(mock): user + riskProfile + watchlist mock data fixtures
861c833 feat(mock): 30-item PerformanceRecord mock data fixture
32ea8fe feat(mock): 3-card recommendation card mock data + no_call
28103c2 feat(dto): saveRiskProfile() Server Action input Zod schema
da9b356 feat(dto): saveWatchlist() Server Action input Zod schema
47e3b79 feat(dto): RecommendationCard output Zod schema (client-facing)
f5c0038 feat(dto): GET /api/recommendations/today response DTO
1cc7294 test(dto): reasonLine validation — length 1-160, whitespace rejection
```

패턴이 보인다: **스키마 → mock fixture → Server Action DTO → API 응답 DTO → 필드 단위 검증 테스트** 순서로 한 방향으로만 진행된다. 이게 우연이 아니라 스킬의 4~5단계(엔터티 → Zod 스키마 → Route Handler/Server Action → 테스트)를 그대로 따른 결과다.

[스크린샷 삽입 위치: GitHub 저장소의 커밋 히스토리 화면 — https://github.com/hy2207/ai-stock-alarm-app/commits/main ]

## 4. 인터페이스 단위로도 쪼갠다

SRS Appendix에 있는 API·Server Action 목록도 각각 별도 태스크로 변환한다.

| Task | 실제 예 |
|---|---|
| 라우트/액션 시그니처 정의 | `app/api/recommendations/today/route.ts`, `saveWatchlist()` |
| Zod 입출력 스키마 | `SaveWatchlistInput`, `RecommendationCardSchema` |
| 서버 로직 | Prisma 쿼리, `unstable_cache`, LLM `streamObject()` 오케스트레이션 |
| 인증/권한 | NextAuth 세션, `CRON_SECRET`, 미들웨어 보호 경로 |
| 에러/No Call 처리 | HTTP 5xx 금지, No Call 카드, `llm_call_failed` 이벤트 |
| 클라이언트 연동 | `posthog-js` capture, 가격 복사/브로커 리다이렉트 |
| 테스트 | 단위/스키마 검증/E2E |

이 표 하나로 API 엔드포인트 하나가 태스크 7개로 쪼개진다. 처음엔 과하다고 생각했는데, 실제로 리뷰할 때 "이 커밋에서 뭘 확인해야 하는지"가 명확해져서 리뷰 시간이 오히려 줄었다.

## 5. NFR도 태스크가 된다

성능/보안/운영 요구사항(NFR)은 별도 트랙으로 뺐다. 예를 들어 "홈 추천 p95 ≤ 800ms"라는 NFR 하나는 이렇게 갈라진다.

- 성능: k6/Playwright로 `/api/recommendations/today` p95 측정, streamObject TTFB 검증
- 보안: NextAuth 세션·OAuth 스코프 최소화, Supabase RLS 점검, 시크릿 미기록 린트
- 운영: PostHog 대시보드 알림, `/api/admin/health` freshness 알림, Gemini/OneSignal 비용 모니터링

기능 개발 태스크에 섞어서 처리하면 항상 뒷전으로 밀리는 항목들이라, 아예 별도 카테고리로 분리해서 빠뜨리지 않게 만들었다.

## 6. 정리

SRS를 태스크로 쪼개는 절차 자체를 스킬로 문서화해 둔 덕분에, 어떤 AI 도구를 쓰든 REQ 하나가 같은 방식으로 커밋 단위까지 내려간다. 결과물이 "느낌"이 아니라 절차라서, 새 REQ가 추가돼도 매번 같은 흐름(스키마 → mock → DTO → 로직 → 테스트)으로 쪼개진다. 다음 편에서는 이 절차를 Cursor, Claude Code, Antigravity 세 도구가 동시에 참조할 수 있게 만든 하네스 구조를 다룬다.
