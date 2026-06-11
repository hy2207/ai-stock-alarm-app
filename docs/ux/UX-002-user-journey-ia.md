# UX-002: 핵심 사용자 여정 및 IA/화면 목록

> 이 문서는 UX-001 원칙을 화면 구조로 변환한다. v1의 첫 화면 경험은 뉴스/차트 탐색이 아니라 1~3개 Decision Layer 추천 카드 검토로 시작한다.

## IA Summary

- Primary route: `/` -> SCR-HOME
- Auth route: `/login` -> SCR-LOGIN
- Onboarding route: `/onboarding` -> SCR-ONBOARDING
- Recommendation detail route: `/recommendations/[recId]` -> SCR-RECOMMENDATION-DETAIL
- Settings route: `/settings` -> SCR-SETTINGS
- Archive route: `/archive` -> SCR-ARCHIVE
- Push landing route: `/push/[recId]` or notification URL payload -> SCR-PUSH-LANDING

## Screen Inventory

| Screen ID | Purpose | Entry condition | Exit condition | Protected route | Empty or error state | Downstream tasks |
|---|---|---|---|---|---|---|
| SCR-LOGIN | Authenticate before protected recommendation features | Unauthenticated user opens `/login` or is redirected from a protected route | OAuth/email auth succeeds -> prior destination or SCR-HOME | No | Provider failure, expired callback, or missing email shows retry copy without secrets | AUTH-Q01, AUTH-C02 |
| SCR-ONBOARDING | Collect 1~3 tickers/sectors before first recommendation | Authenticated user has no watchlist | Save valid watchlist -> SCR-HOME | Yes | 0 selections, over 3 selections, save failure | ONB-Q01, ONB-C01 |
| SCR-HOME | Show today's 1~3 actionable recommendation cards | Authenticated user opens app, returns from settings/archive/detail, or push fallback lands home | Card tap -> SCR-RECOMMENDATION-DETAIL; settings/archive nav; risk mode changes in place | Yes | No Call card, loading skeleton, no watchlist CTA, data freshness error copy | REC-Q03, CONF-Q01 |
| SCR-RECOMMENDATION-DETAIL | Explain the selected card without chart-first UI | Card tap or valid deep link with `recId` | Back -> SCR-HOME; archive ticker link -> SCR-ARCHIVE | Yes | Missing/unauthorized recId -> SCR-HOME with non-5xx state copy | REC-Q02, TRUST-Q03 |
| SCR-SETTINGS | Edit risk mode, watchlist, push consent, and account settings | User opens settings from global navigation | Save settings -> remain; back/home nav -> SCR-HOME | Yes | Save validation, push permission denied, stale session | ONB-Q02, CONF-Q02 |
| SCR-ARCHIVE | Review prior recommendations and success/failure outcomes | User opens archive from navigation or detail trust link | Ticker row/card -> SCR-RECOMMENDATION-DETAIL when rec exists; back/home nav | Yes | No performance data -> "데이터 축적 중" | ARC-Q02, TRUST-Q02 |
| SCR-PUSH-LANDING | Resolve notification target quickly after tap | User taps morning briefing push notification | Valid recId -> SCR-RECOMMENDATION-DETAIL; invalid/missing recId -> SCR-HOME | Yes | Expired/malformed deeplink emits fallback state, not a 5xx page | PUSH-Q01 |
| SCR-EMPTY-STATE | Reusable state surface for no watchlist, no cards, no performance records | Any screen has valid request but no usable data | Primary CTA routes to the next best screen | Context-dependent | "데이터 축적 중", "관심 종목을 먼저 선택하세요", or No Call reason | ONB-Q01, REC-Q04, TRUST-Q02 |
| SCR-ERROR-STATE | Reusable non-5xx user-facing fallback | Recoverable auth, data, LLM, or network failure | Retry, back, or home fallback | Context-dependent | Never exposes raw stack traces, secrets, provider payloads, or HTTP 5xx text | UX-010, TEST-F10-01 |

## New user journey

1. SCR-LOGIN: user authenticates with OAuth or email.
2. SCR-ONBOARDING: user selects 1~3 tickers/sectors.
3. SCR-HOME: user sees today's 1~3 cards or No Call state.
4. SCR-HOME: user changes `aggressive`, `balanced`, `conservative` risk mode without an extra LLM call.
5. SCR-RECOMMENDATION-DETAIL: user opens one card only if more context is needed.

## Returning user journey

1. User opens `/` or a saved app shortcut.
2. If the session is valid, SCR-HOME restores the saved risk mode and watchlist context.
3. If the session is expired, the user follows Unauthenticated fallback.
4. User reviews recommendation cards first, then optionally checks SCR-ARCHIVE or SCR-SETTINGS.

## Decision Layer review

The main path is SCR-HOME -> SCR-RECOMMENDATION-DETAIL -> SCR-ARCHIVE. SCR-HOME must lead with:

- Direction: buy, sell, hold, or no_call.
- Executable entry price or entry range.
- Target price or target range where available.
- Hold horizon within 1~10 days, with the product culture centered on 3~5 business days.
- Interactive risk mode: `aggressive`, `balanced`, `conservative`.
- A non-empty reason line of 160 characters or less.
- Fixed legal disclaimer copy.

SCR-RECOMMENDATION-DETAIL may add evidence and similar patterns, but the main fold still excludes candle charts, RSI, MACD, and chart-first technical analysis.

## Trust Layer placement

- SCR-HOME may show compact trust context only when it supports the card decision.
- SCR-RECOMMENDATION-DETAIL exposes evidence snapshots and current evaluation state without turning the first fold into a chart dashboard.
- SCR-ARCHIVE owns historical performance review and must include success/failure records when data exists.
- Empty trust data uses "데이터 축적 중" rather than hiding the section.

## Unauthenticated fallback

- Any protected route without a valid session redirects to `/login`.
- SCR-LOGIN stores or receives the intended destination when available.
- Successful login returns to the intended destination if it is safe and internal.
- Unsafe, missing, or stale destinations return to SCR-HOME.
- Raw OAuth tokens, provider errors, user identifiers, and secrets are never shown in copy or logs.

## Push deeplink fallback

- A valid push payload with `recId` routes to SCR-PUSH-LANDING, then SCR-RECOMMENDATION-DETAIL.
- Missing or stale `recId` routes to SCR-HOME with a short fallback message.
- Unauthenticated push taps route to SCR-LOGIN first, then continue to the safe internal destination.
- Failure states must avoid 5xx exposure and should be measurable by the future push/deeplink analytics tasks.

## Navigation Rules

| From | Primary target | Back/fallback |
|---|---|---|
| SCR-LOGIN | Prior safe route or SCR-HOME | SCR-HOME for invalid return URLs |
| SCR-ONBOARDING | SCR-HOME | SCR-ONBOARDING until at least 1 valid item exists |
| SCR-HOME | SCR-RECOMMENDATION-DETAIL, SCR-SETTINGS, SCR-ARCHIVE | SCR-HOME |
| SCR-RECOMMENDATION-DETAIL | SCR-ARCHIVE, SCR-HOME | SCR-HOME if referrer is missing |
| SCR-SETTINGS | SCR-HOME | SCR-HOME with unsaved-change handling in later UX tasks |
| SCR-ARCHIVE | SCR-RECOMMENDATION-DETAIL | SCR-HOME |
| SCR-PUSH-LANDING | SCR-RECOMMENDATION-DETAIL or SCR-HOME | SCR-HOME |

## Task Mapping

| Task | Screen IDs |
|---|---|
| AUTH-Q01 | SCR-LOGIN |
| ONB-Q01 | SCR-ONBOARDING, SCR-EMPTY-STATE |
| REC-Q03 | SCR-HOME |
| PUSH-Q01 | SCR-PUSH-LANDING, SCR-RECOMMENDATION-DETAIL, SCR-HOME |
| ARC-Q02 | SCR-ARCHIVE, SCR-RECOMMENDATION-DETAIL |

## DoD Checklist

- All v1 screens and reusable states are identified.
- Entry condition, Exit condition, Protected route, and Empty or error state are documented for every screen.
- Deep links and unauthenticated fallback paths are explicit.
- Downstream implementation tasks have stable screen IDs.
- Decision Layer, risk mode interaction, no-chart main fold, and Trust Layer principles from UX-001 remain intact.
