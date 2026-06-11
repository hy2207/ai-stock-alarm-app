# UX-006: 온보딩·관심 종목 설정 UX 명세

> 이 문서는 신규 사용자의 onboarding watchlist 선택과 설정 화면의 existing watchlist 수정 흐름을 정의한다. Server Action, Zod 검증, Prisma 저장은 ONB-C01/ONB-C02에서 구현한다.

## Onboarding Flow

1. User lands on SCR-ONBOARDING after login when no watchlist exists.
2. The screen explains that selecting 1~3 tickers or sectors enables the first Decision Layer recommendation set.
3. User selects ticker or sector chips/cards.
4. The continue CTA stays disabled until minimum 1 item is selected.
5. When at least one valid item exists, the continue CTA becomes active and routes toward SCR-HOME after save.
6. If recommendation generation is not ready, the home CTA can lead to SCR-HOME with a loading or No Call state.

## Selection Model

| Item state | UX rule |
|---|---|
| unselected | Default neutral chip/card. Activating it adds the item when fewer than 3 items are selected. |
| selected | Selected item shows clear selected state, accessible label, and removal affordance. |
| deselected | Tapping or keyboard activating a selected item removes it and updates the counter. |
| disabled | Additional unselected items become disabled when maximum 3 items are already selected. |
| invalid | An item cannot be both ticker and sector in the same watchlist row. |

## Selection Limits and Copy

| State | Rule | Copy |
|---|---|---|
| Empty | minimum 1 item is required before continuing | 관심 종목 또는 섹터를 1개 이상 선택해 주세요. |
| Valid | 1~3 items selected | 선택한 관심 목록으로 오늘의 추천을 준비합니다. |
| Full | maximum 3 items selected | 최대 3개까지 선택 가능합니다. |
| Over limit attempt | Keep existing selection unchanged and show inline feedback | 최대 3개까지 선택 가능합니다. 다른 항목을 해제한 뒤 선택해 주세요. |
| Save success | Persisted watchlist is accepted | 관심 목록을 저장했습니다. |
| Save failure | Save failed without exposing raw error | 관심 목록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요. |

## Component Pattern

- Use Card or chip-like Button patterns for ticker and sector options.
- Keep the selected counter visible: "선택됨 2/3".
- Search/filter can appear above the option list when available, but selection remains the primary action.
- Mobile layout stacks option groups, counter, inline error, and continue CTA.
- Desktop may use two columns for ticker and sector groups, but the CTA and limit copy remain visible.
- The continue CTA and home CTA must have at least 44px touch target height on mobile.

## Settings Edit Flow

| Step | UX requirement |
|---|---|
| Entry | User opens settings with an existing watchlist loaded. |
| Edit | Existing ticker/sector items appear in selected state and can be removed or replaced. |
| Validation | The same minimum 1 and maximum 3 rules apply as onboarding. |
| Save | Save CTA is enabled only when the list is valid and changed. |
| save success | Show save success feedback: 변경한 관심 목록을 반영했습니다. 다음 추천부터 적용됩니다. |
| save failure | Show save failure feedback without raw provider or database errors. |
| Cancel/back | Unsaved changes should be confirmed in later implementation if destructive. |

## Accessibility Rules

- Every item must be keyboard reachable.
- selected, unselected, disabled, and invalid states must be conveyed with text or ARIA, not color alone.
- Inline limit and validation messages should be announced to screen reader users.
- Focus should remain stable after selecting, deselecting, or hitting the maximum 3 limit.
- The continue CTA and save CTA need visible focus rings.

## Downstream Task Mapping

| Task | Uses this spec for |
|---|---|
| ONB-Q01 | Onboarding selection UI, counter, disabled over-limit state, and continue CTA. |
| ONB-Q02 | Settings edit UI, existing watchlist state, save success, and save failure feedback. |
| ONB-C01 | `saveWatchlist()` behavior after valid onboarding selection. |
| ONB-C02 | Existing watchlist update behavior from settings. |

## Product Guardrails

- Onboarding should not ask for brokerage account details or order permissions.
- The watchlist exists to narrow Decision Layer cards, not to create a portfolio optimizer.
- Do not introduce charts, candle, RSI, MACD, or market dashboards into onboarding.
- The user should understand that only 1~3 inputs are needed for v1.

## DoD Checklist

- onboarding selection UI and continue CTA are defined.
- ticker and sector selected, unselected, deselected, and disabled states are defined.
- minimum 1 and maximum 3 limits with Korean copy are defined.
- settings existing watchlist edit, save success, and save failure flows are defined.
- ONB-Q01, ONB-Q02, ONB-C01, and ONB-C02 can implement without inventing UX rules.
