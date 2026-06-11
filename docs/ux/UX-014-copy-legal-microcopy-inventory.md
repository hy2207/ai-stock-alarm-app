# UX-014: UI 카피, 법적 면책, 마이크로카피 인벤토리

> 이 문서는 UX-001~003의 Decision Layer 원칙을 사용자-facing 문구로 고정한다. 구현자는 hardcode 대신 copy key를 기준으로 재사용하고, 법무 검토가 필요한 문구는 `legal review required` 표시를 유지한다.

## Tone Principles

- 사용자는 투자 결정을 위임하는 것이 아니라 참고 정보를 검토한다.
- 추천 실패와 데이터 부족을 숨기지 않고 짧고 명확하게 설명한다.
- CTA는 다음 행동을 안내하되 매수/매도 주문을 직접 유도하지 않는다.
- 원문 API 오류, OAuth 토큰, 사용자 식별자, 내부 provider payload는 사용자 카피와 로그에 노출하지 않는다.
- 성과 공개는 success/failure를 함께 보여주며, 실패 기록도 숨기지 않습니다.

## Required Legal Copy

| Copy key | Korean copy | Usage | Review |
|---|---|---|---|
| legal.disclaimer.investment_advice | 투자 참고용 정보이며 투자 자문이 아닙니다. 최종 투자 판단과 책임은 사용자에게 있습니다. | Recommendation Card, Detail, No Call | legal review required |
| legal.disclaimer.no_order_execution | 이 서비스는 브로커 주문 실행을 제공하지 않습니다. | Broker redirect CTA vicinity | legal review required |
| legal.disclaimer.performance | 과거 성과는 미래 수익을 보장하지 않습니다. | Trust Layer, Archive | legal review required |

## Onboarding and Watchlist Copy

| Copy key | Korean copy | Trigger |
|---|---|---|
| watchlist.empty.required | 관심 종목 또는 섹터를 1개 이상 선택해 주세요. | 0 selections |
| watchlist.limit.max_3 | v1에서는 최대 3개까지만 선택할 수 있습니다. | 4th selection attempt |
| watchlist.item.invalid | 종목 또는 섹터 중 하나만 선택해 주세요. | Invalid item |
| watchlist.save.success | 관심 목록을 저장했습니다. 오늘의 추천을 확인해 보세요. | Save success |
| watchlist.save.failure | 관심 목록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요. | Save failure |
| watchlist.edit.saved | 변경한 관심 목록을 반영했습니다. | Settings edit success |

## Recommendation and No Call Copy

| Copy key | Korean copy | Trigger |
|---|---|---|
| recommendation.no_call | 오늘은 실행 가능한 추천이 없습니다. 데이터가 충분해지면 다시 판단합니다. | No Call card |
| recommendation.data_shortage | 판단에 필요한 시장 데이터가 부족합니다. | Missing/partial market data |
| recommendation.llm_failure | 추천 생성 중 문제가 발생했습니다. 잘못된 정보를 보여주지 않기 위해 No Call로 처리했습니다. | LLM timeout, rate limit, validation failure |
| recommendation.reason.unavailable | 한 줄 이유를 생성하지 못했습니다. | Missing reasonLine fallback |
| recommendation.price.copy_success | 가격을 복사했습니다. 주문 전 직접 확인해 주세요. | Price copy success |
| recommendation.price.copy_failure | 가격을 복사하지 못했습니다. 수동으로 확인해 주세요. | Clipboard failure |

## Trust and Performance Copy

| Copy key | Korean copy | Trigger |
|---|---|---|
| trust.history.empty | 데이터 축적 중입니다. 추천 결과가 쌓이면 성공과 실패 이력을 함께 보여드립니다. | No performance records |
| trust.history.summary | 최근 추천의 성공/실패 기록을 함께 확인하세요. | Trust Layer header |
| trust.record.success | 목표 조건을 충족한 추천입니다. | Hit record |
| trust.record.failure | 목표 조건을 충족하지 못한 추천입니다. | Miss record |
| trust.record.pending | 아직 평가 중인 추천입니다. | Open evaluation |
| trust.pattern.hidden | 유사 패턴 데이터가 충분하지 않아 표시하지 않습니다. | Missing optional patterns |

## Auth, Privacy, and Session Copy

| Copy key | Korean copy | Trigger |
|---|---|---|
| auth.login.required | 추천을 보려면 로그인이 필요합니다. | Protected route fallback |
| auth.session.expired | 세션이 만료되었습니다. 다시 로그인해 주세요. | Expired session |
| auth.login.failure | 로그인에 실패했습니다. 다른 방법으로 다시 시도해 주세요. | Auth provider failure |
| privacy.data_minimized | 서비스 제공에 필요한 최소 정보만 저장합니다. | Privacy/settings surface |
| privacy.delete_account.warning | 계정 삭제 후 추천 이력과 설정은 복구할 수 없습니다. | Delete account confirmation |
| privacy.raw_identifier.hidden | 개인 식별자와 인증 토큰은 화면에 표시하지 않습니다. | Internal UX rule |

## Push Permission and Deeplink Copy

| Copy key | Korean copy | Trigger |
|---|---|---|
| push.permission.request | 아침 추천 브리핑을 받으려면 알림 권한을 허용해 주세요. | Push permission prompt |
| push.permission.denied | 알림 권한이 꺼져 있습니다. 설정에서 다시 켤 수 있습니다. | Permission denied |
| push.permission.saved | 알림 설정을 저장했습니다. | Consent saved |
| push.deeplink.expired | 알림 링크가 만료되어 홈으로 이동했습니다. | Expired push link |
| push.deeplink.fallback | 추천을 찾을 수 없어 오늘의 홈 화면으로 이동했습니다. | Missing recId |

## Empty, Loading, and Error Copy

| Copy key | Korean copy | Trigger |
|---|---|---|
| state.loading.cards | 오늘의 추천을 준비하고 있습니다. | Home card loading |
| state.empty.cards | 아직 표시할 추천이 없습니다. 관심 목록을 확인해 주세요. | Empty recommendations |
| state.error.retry | 일시적인 문제가 발생했습니다. 다시 시도해 주세요. | Recoverable error |
| state.error.safe_home | 요청한 화면을 열 수 없어 홈으로 이동했습니다. | Fallback navigation |
| state.error.no_5xx | 내부 오류 상세는 표시하지 않습니다. | UX implementation rule |

## Copy Reuse Rules

- UI implementation should reference copy keys rather than duplicating free text across components.
- Legal disclaimer copy must remain visible on recommendation card surfaces.
- Copy should fit compact Decision Layer cards; long explanations move to detail or support copy.
- No copy should imply guaranteed returns, personalized investment advice, or automatic order execution.
- No user-facing copy should include raw API keys, OAuth tokens, provider payloads, user identifiers, or stack traces.

## DoD Checklist

- Required legal disclaimer copy is defined and marked legal review required.
- Watchlist selection limits, 0-selection state, save success, and save failure copy are defined.
- No Call, data shortage, LLM failure, and 데이터 축적 중 states are defined.
- Auth, session, privacy, push permission, and deeplink fallback copy are defined.
- Trust copy makes success/failure transparency explicit.
