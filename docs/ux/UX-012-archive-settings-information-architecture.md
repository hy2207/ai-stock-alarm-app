# UX-012: 추천 이력 아카이브·설정 정보 구조

> 이 문서는 과거 추천 결과와 watchlist 설정을 사용자가 찾고 수정할 수 있도록 archive/settings IA를 정의한다. 실제 Prisma 조회와 목록 UI 구현은 ARC-Q01, ARC-Q02, ONB-Q02에서 수행한다.

## Archive Purpose

- Archive is the primary Trust Layer destination for historical recommendations.
- It must show success/failure outcomes when data exists, not only successful cases.
- It helps users understand prior recommendation quality without turning the app into a chart dashboard.

## Archive List Field Priority

| Priority | Field | UX rule |
|---:|---|---|
| 1 | ticker | Always visible. Serves as the primary grouping and scan anchor. |
| 2 | predictedDirection | Show buy, sell, hold, or no_call in text with semantic styling. |
| 3 | realizedReturn | Show signed percentage return when evaluated. Use 수익률 label. |
| 4 | hitFlag | Show success, failure, or pending status with a text label. |
| 5 | evaluatedAt | Show latest evaluation date; pending records may show generated date instead. |
| 6 | holdDays | Useful secondary context for 1~10 day recommendation horizon. |
| 7 | reasonLine | Optional compact preview; detail page owns full explanation. |

## Grouping, Filtering, and Sorting

- Default sorting: latest first by evaluatedAt, then generatedAt for pending records.
- ticker filter: users can narrow archive rows to one ticker or sector context.
- grouping: archive may group by ticker on desktop and use ticker sections or cards on mobile.
- Status filter may include all, success, failure, pending, and no_call.
- Empty filtered results should keep the filter visible and explain that no matching records exist.

## Success, Failure, and Return Display

| Outcome | Display |
|---|---|
| success | Show "성공" plus realizedReturn when available. |
| failure | Show "실패" plus realizedReturn when available. |
| pending | Show "평가 중" and the expected evaluation window when available. |
| no_call | Show "No Call" as a valid recommendation state, not an error. |

- success/failure labels must appear with color or icon, not color alone.
- 수익률 should include sign and percent formatting.
- Negative returns are not hidden or softened.
- Detail links should preserve the selected ticker context where practical.

## Empty States and Next Actions

| State | Copy | Next action |
|---|---|---|
| New user with no records | 데이터 축적 중입니다. 추천 결과가 쌓이면 성공과 실패 이력을 함께 보여드립니다. | Go to settings to confirm watchlist or return home. |
| Ticker has no history | 이 종목의 추천 이력이 아직 없습니다. | Adjust ticker filter or edit watchlist. |
| No evaluated records | 아직 평가가 끝난 추천이 없습니다. | Show pending records when available. |
| Data load failure | 이력을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요. | Retry or return home. |

Every empty state is an empty state, not a 5xx page or raw database error.

## Settings Information Architecture

- settings entry points: global navigation, empty archive CTA, onboarding completion, and recommendation detail context menu where appropriate.
- watchlist section appears above lower-frequency account actions.
- existing watchlist items show ticker/sector, selected state, and edit/remove affordance.
- Editing watchlist uses the same minimum 1 and maximum 3 rules from UX-006.
- Save success should state that changes apply to the next recommendation cycle.
- Save failure should avoid raw Prisma, provider, or network payload details.

## Navigation Rules

| From | To | Rule |
|---|---|---|
| SCR-ARCHIVE | SCR-RECOMMENDATION-DETAIL | Row/card click opens detail when rec exists. |
| SCR-ARCHIVE | SCR-SETTINGS | Empty state or nav CTA lets users edit watchlist. |
| SCR-SETTINGS | SCR-ARCHIVE | After save, user may return to archive to review history. |
| SCR-RECOMMENDATION-DETAIL | SCR-ARCHIVE | Trust Layer link opens ticker-specific archive when available. |
| SCR-SETTINGS | SCR-HOME | Back/home returns to current recommendation decision path. |

## Downstream Task Mapping

| Task | Uses this spec for |
|---|---|
| ARC-Q01 | Query shape and default latest first archive data expectations. |
| ARC-Q02 | Archive screen UI fields, grouping, filters, empty states, and row/card behavior. |
| ONB-Q02 | Settings watchlist edit entry points, existing watchlist display, and save feedback. |

## Product Guardrails

- Archive is a Trust Layer surface and should include both success/failure outcomes.
- Archive and settings must not expose broker account data or imply order execution.
- No candle, RSI, MACD, or chart-first widgets should appear as the primary archive experience.
- Settings should not become a portfolio optimizer; it only edits watchlist, risk mode, push consent, and account actions.

## DoD Checklist

- ticker, predictedDirection, realizedReturn, hitFlag, and evaluatedAt field priority is defined.
- ticker filter, grouping, latest first sorting, and status filtering are defined.
- success, failure, pending, no_call, and 수익률 display rules are defined.
- Archive empty states and settings next actions are defined.
- ARC-Q01, ARC-Q02, and ONB-Q02 can implement without inventing IA rules.
