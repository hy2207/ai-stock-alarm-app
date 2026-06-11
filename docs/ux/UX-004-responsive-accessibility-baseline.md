# UX-004: 반응형·접근성 기준

> 이 문서는 PC/모바일 브라우저에서 Decision Layer 핵심 정보를 읽고 조작하기 위한 responsive and accessibility baseline이다. 구현은 Tailwind CSS + shadcn/ui 기준을 따른다.

## Viewport Baselines

| Viewport | Width baseline | Layout intent |
|---|---:|---|
| mobile | 360px minimum | One-column decision flow. Recommendation card content, risk mode toggle, CTA, and disclaimer remain visible without horizontal scroll. |
| tablet | 768px minimum | Two-column opportunities may appear only when the decision card remains primary. Trust Layer or secondary actions can sit beside or below the card. |
| desktop | 1024px minimum | Wider layouts may show navigation, card list, and detail/trust summaries together, but the first fold still prioritizes the recommendation decision. |

## Responsive Surface Rules

| Surface | mobile rule | tablet/desktop rule |
|---|---|---|
| recommendation card | Stack ticker, direction, executable price, hold horizon, risk mode toggle, reasonLine, disclaimer. Keep the primary decision above secondary evidence. | Cards may sit in a 1~3 column grid, but each card keeps the same information order. |
| risk mode toggle | Use full-width Tabs or Segmented Control with labels for `aggressive`, `balanced`, `conservative`. | Keep the toggle close to the card content it changes. |
| CTA | Primary CTA and secondary CTA stack vertically with at least 44px touch target height. | CTA row may be horizontal when labels remain readable. |
| performance card | Show hit/miss, realized return, and evaluated date as compact rows. | May combine into Card or Table summary with success/failure labels. |
| archive table | Collapse archive table rows into cards when columns would require horizontal scroll. | Use Table for ticker, direction, hold period, realized return, and hit/miss status. |
| settings form | Single-column grouped controls with clear save feedback. | Wider forms can group related sections, but save/error feedback remains adjacent to the edited section. |

## Accessibility Standards

- keyboard: all controls, rows that open details, Tabs, Segmented Control options, CTA buttons, dialogs, and retry actions must be reachable by keyboard.
- focus ring: every interactive element uses a visible focus ring or focus-visible border that is not color-only.
- aria-label: icon-only or ambiguous controls require an aria-label or visible text label.
- screen reader: status changes such as save success, No Call, visible error, push permission denial, and session expiration must be available to screen reader users.
- Use semantic buttons and links according to behavior. Broker redirect is a link-like secondary action, not an order button.
- Preserve logical heading order: screen title, card title/ticker, card sections, then Trust Layer sections.

## Visual Accessibility Standards

| Standard | Baseline |
|---|---|
| contrast | Body text and key decision numbers should meet WCAG AA contrast. Semantic status colors require text labels as backup. |
| touch target | Primary touch target size is at least 44px height/width where practical. Dense table rows may be smaller only on desktop pointer layouts. |
| visible error | Errors use visible error text near the failed control and a recoverable action. Do not expose raw 5xx text, stack traces, secrets, or provider payloads. |
| motion | Avoid motion that delays reading the card decision. Mode changes should be instant and subtle. |
| truncation | reasonLine should fit within 160 characters; if truncated visually, full text must remain accessible in detail or label text. |

## Product Guardrails

- The main fold must not render candle charts, RSI, MACD, or chart-first technical indicators.
- Recommendation detail can reveal more evidence, but not at the cost of hiding direction, executable price/range, hold horizon, risk mode, reasonLine, and disclaimer.
- Trust Layer performance content must include success/failure records when data exists and must have an accessible empty state when data is still accumulating.
- Color cannot be the only signal for buy/sell/hold/no_call, success/failure, selected, disabled, or error.
- No layout should imply broker order execution in v1.

## UX-016 Design QA Checklist

These items should be reused by UX-016 and later visual QA:

- Verify mobile 360px, tablet 768px, and desktop 1024px layouts.
- Verify recommendation card, risk mode toggle, CTA, performance card, and archive table do not require horizontal scroll on mobile.
- Verify keyboard tab order follows the visual decision flow.
- Verify focus ring is visible on buttons, links, toggles, table/card rows, and dialogs.
- Verify aria-label or visible label exists for icon-only controls.
- Verify screen reader text exists for loading, No Call, visible error, session expired, and push permission denied states.
- Verify contrast and 44px touch target requirements for primary controls.
- Verify candle, RSI, MACD, and chart-first modules are absent from the main fold.
- Verify Trust Layer success/failure and "데이터 축적 중" states are visible and readable.

## DoD Checklist

- mobile, tablet, and desktop viewport baselines are defined.
- recommendation card, risk mode toggle, CTA, performance card, and archive table responsive behavior is specified.
- keyboard, focus ring, aria-label, and screen reader standards are explicit.
- contrast, touch target, and visible error standards are explicit.
- UX-016 can reuse the checklist without inventing new QA criteria.
