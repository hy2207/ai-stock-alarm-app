# UX-005: 로그인·세션 UX 명세

> 이 문서는 인증 구현이 아니라 인증 화면 상태와 사용자 안내 기준을 정의한다. NextAuth.js provider 설정, OAuth secret, middleware, JWT refresh 구현은 AUTH-C01~C03에서 다룬다.

## Login Screen Priority

| Element | Priority | UX rule |
|---|---:|---|
| Google login | primary CTA | 가장 먼저 노출한다. 버튼 라벨은 "Google로 계속하기"처럼 provider와 행동을 모두 포함한다. |
| Kakao login | secondary CTA | Google 아래 또는 같은 CTA 그룹에 배치한다. provider 가용성은 환경 설정에 따라 구현 태스크에서 제어한다. |
| email login | secondary CTA | OAuth가 어렵거나 선호하지 않는 사용자를 위한 대체 경로로 제공한다. |
| reason copy | supporting | "추천을 저장하고 아침 브리핑을 받으려면 로그인이 필요합니다."처럼 기능 이유를 설명한다. |
| privacy copy | supporting | 최소 정보 저장 원칙을 짧게 안내한다. |

## Protected Route Fallback

- protected route: SCR-HOME, SCR-RECOMMENDATION-DETAIL, SCR-SETTINGS, SCR-ARCHIVE, SCR-PUSH-LANDING.
- Unauthenticated users are redirected to `/login`.
- The redirect may carry a `returnTo` value only when it is a safe internal path.
- A safe internal destination starts with `/`, does not start with `//`, and does not include an external origin.
- Missing, unsafe, malformed, or stale `returnTo` falls back to SCR-HOME.
- Login copy must explain why login is needed and the next action, not expose technical auth details.

## Session States

| State | User copy | Next action |
|---|---|---|
| unauthenticated | 로그인이 필요합니다. 추천과 설정을 보려면 로그인해 주세요. | Show login CTAs. |
| session expired | session expired: 세션이 만료되었습니다. 다시 로그인해 주세요. | Show re-login CTA and preserve safe `returnTo` when possible. |
| refresh failed | refresh failed: 세션을 갱신하지 못했습니다. 다시 로그인해 주세요. | Show re-login CTA and avoid infinite refresh loops. |
| re-login | re-login: 계속하려면 다시 로그인해 주세요. | User chooses Google, Kakao, or email login again. |
| provider failure | 로그인에 실패했습니다. 다른 방법으로 다시 시도해 주세요. | Return to login options without raw provider details. |
| forbidden fallback | 접근 권한이 없어 홈으로 이동했습니다. | Route to SCR-HOME with non-5xx copy. |

## Screen State Mapping

| Screen/state | UX requirement | Downstream task |
|---|---|---|
| Login page | OAuth/email options, reason copy, privacy copy, retry state | AUTH-Q01 |
| Middleware redirect | Unauthenticated protected route -> `/login` with safe `returnTo` | AUTH-C02 |
| Session refresh | Expiring session attempts refresh; refresh failed routes to re-login | AUTH-C03 |
| Push deeplink auth | Unauthenticated deeplink goes to login first, then safe internal destination | AUTH-C02, PUSH-Q01 |
| Account deletion reauth | Destructive action may require re-login before confirmation | AUTH-Q01, AUTH-C04 |

## Security and Privacy Copy Rules

- Never show OAuth token, refresh token, provider payload, raw callback URL, user identifier, email verification token, session secret, or stack trace.
- Error messages should be recoverable and short.
- Provider-specific failures can be grouped as login failure unless the user can act on the distinction.
- Do not log raw user identifiers in UI debug surfaces.
- Do not imply broker order permissions or trading account access.
- Privacy copy should state that the app stores only the minimum account, watchlist, risk mode, recommendation, and consent data needed for the service.

## Accessibility and Responsive Rules

- Login CTAs must be keyboard reachable and have visible focus ring.
- Provider buttons need visible text labels and accessible names.
- Error and session expired messages should be exposed to screen reader users.
- On mobile, Google, Kakao, and email CTAs stack vertically with at least 44px touch target height.
- Avoid layout shifts when provider availability loads.

## Decision Layer Alignment

- Authentication is a gate to preserve saved watchlist, risk mode, Trust Layer history, and push consent.
- Login is not a marketing splash; it should quickly return the user to the recommendation decision path.
- The login screen should not introduce charts, candle, RSI, MACD, or market dashboards.
- Post-login navigation should prioritize SCR-HOME or the original safe internal recommendation/detail route.

## DoD Checklist

- Google, Kakao, and email login choices with primary CTA and secondary CTA priority are defined.
- Protected route fallback to `/login`, `returnTo`, and safe internal destination rules are defined.
- session expired, refresh failed, and re-login states are defined.
- OAuth token, provider payload, user identifier, and secret exposure are explicitly prohibited.
- AUTH-Q01, AUTH-C02, and AUTH-C03 implementation tasks can reference the state mapping.
