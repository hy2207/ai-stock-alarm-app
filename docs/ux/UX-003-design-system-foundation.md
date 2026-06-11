# UX-003: 디자인 시스템 기초 정의

> 이 문서는 UX-001 제품 원칙과 UX-002 화면 구조를 구현 가능한 Tailwind CSS + shadcn/ui 디자인 기준으로 변환한다. 목표는 화려한 대시보드가 아니라 actionable card first Decision Layer UI를 일관되게 만드는 것이다.

## Foundation

- Runtime UI stack: Next.js App Router, Tailwind CSS utility classes, shadcn/ui copy-in components.
- Primary output: recommendation and trust surfaces that help users decide, not chart exploration.
- Interaction model: `aggressive`, `balanced`, `conservative` risk modes are selected with a visible control, not only shown as a passive badge.
- Horizon culture: copy and layout should make 1~10 day recommendations feel natural, with 3~5 business days as the default mental model.
- Main fold rule: recommendation card and detail first folds do not lead with candle charts, RSI, MACD, or chart-first technical analysis.

## Design Tokens

| Token group | Baseline | Usage rule |
|---|---|---|
| color | Neutral surface, high-contrast text, semantic accents | Reserve color emphasis for direction, risk mode, status, and trust outcomes. Avoid one-hue purple, dark dashboard chrome, and decorative gradients as the primary identity. |
| typography | System sans, compact headings, readable body text | Use clear hierarchy for ticker, direction, executable price, hold horizon, and reasonLine. Do not use hero-scale text inside app panels. |
| spacing | 4px-based Tailwind scale | Keep cards dense enough for 1~3 recommendations in the first viewport while preserving touch targets. |
| radius | 8px or less for cards and controls | Use consistent shadcn/ui radius; avoid pill-heavy decoration unless the element is a segmented control. |
| border | Subtle neutral borders for separation | Prefer borders and spacing over nested cards. Use stronger borders only for focus and selected states. |
| elevation | Minimal shadow, mostly flat surfaces | Use elevation sparingly for modal/dialog layers, not for every section. |

## shadcn/ui Component Choices

| Pattern | Component candidate | Product usage |
|---|---|---|
| Primary action | Button | Save watchlist, retry, copy price, open broker link. |
| Recommendation surface | Card | Home recommendation card, No Call card, compact Trust Layer summary. |
| Historical data | Table | Archive and performance history where rows need hit/miss and realized return comparison. |
| Risk selection | Tabs or Segmented Control | Immediate switching between `aggressive`, `balanced`, `conservative` variants without extra LLM calls. |
| Feedback | Alert | No Call explanation, data freshness warning, auth/session fallback, push permission denial. |
| Confirmation | Dialog or AlertDialog | Account deletion, destructive settings changes, push permission education when needed. |
| Form controls | Input, Checkbox, Switch, Label | Email login, watchlist selection, consentPush, settings. |

## Shared UI Patterns

### Recommendation Card

- Layout order: ticker -> direction -> executable entry price/range -> target price/range -> hold days -> risk mode control -> reasonLine -> legal disclaimer.
- Use Card for structure and Button for explicit CTAs.
- Keep reasonLine visible and 160 characters or less.
- Preserve actionable card first hierarchy before secondary evidence.
- Do not place candle, RSI, MACD, or chart-first widgets in the main fold.

### Trust Layer Card

- Show success/failure performance records together when data exists.
- Use semantic status color and text labels together; never rely on color alone.
- Empty history uses "데이터 축적 중" rather than hiding the section.
- Keep trust data close to the recommendation but visually secondary to the decision.

### Risk Mode Control

- Use Tabs or Segmented Control for the three modes: `aggressive`, `balanced`, `conservative`.
- selected state must be visible through border/background and accessible state attributes.
- Switching modes should feel instant and must not imply a new LLM call.
- Copy should describe the risk posture, not promise returns.

### Tables and Lists

- Use Table for archive rows with ticker, direction, hold period, realized return, and hit/miss status.
- On mobile, rows may collapse into Card summaries while preserving the same fields.
- Empty Table/Card states must offer the next best action or explain data collection.

## State Styles

| State | Visual rule | Accessibility rule |
|---|---|---|
| success | Use positive semantic accent with text label such as hit/success | Do not encode only by green color. |
| failure | Use caution or negative semantic accent with text label such as miss/failure | Keep tone factual; do not shame the user or hide misses. |
| No Call | Neutral Card or Alert with concise reason and next action | Make it clear this is a valid recommendation state, not an app error. |
| loading | Skeleton or disabled placeholder matching final card shape | Prevent layout shift in the home first fold. |
| disabled | Lower contrast control with unavailable explanation where needed | Keep disabled text readable and avoid pointer-only affordances. |
| focus | Visible ring or border using Tailwind focus-visible classes | All interactive controls must be keyboard reachable. |
| selected | Clear border/background state for active risk mode or active row/card | Pair visual selection with ARIA/current state where appropriate. |
| error | Alert surface with retry/back/home fallback | Never expose raw 5xx, stack traces, provider payloads, secrets, or identifiers. |

## Tailwind Implementation Rules

- Prefer Tailwind tokens and shadcn/ui variants over ad hoc inline styles.
- Keep reusable class patterns near the component that uses them until duplication is proven.
- Use responsive grids and stable min/max constraints for cards and tables.
- Do not create nested card stacks for ordinary sections.
- Do not introduce decorative orbs, bokeh blobs, chart dashboards, or abstract SVG hero art for core app screens.
- Use lucide-react or existing icon patterns for common controls, with labels or tooltips where meaning is not obvious.

## Product Guardrails

- The first fold must communicate the decision: direction, price/range, hold horizon, confidence/risk mode, reasonLine, and disclaimer.
- Trust Layer surfaces must include success/failure history when data exists.
- No Call, loading, empty, and error states are first-class product states and must be styled consistently.
- The design system should reduce cognitive load; it should not add candle charts, RSI, MACD, heavy technical indicators, or dense market dashboards to the main path.
- Broker movement and price copy CTAs are secondary actions and must not look like order execution.

## DoD Checklist

- Tailwind CSS and shadcn/ui implementation rules are explicit.
- color, typography, spacing, radius, border, and elevation token groups are defined.
- Button, Card, Table, Tabs, Segmented Control, and Alert usage is mapped to product screens.
- success, failure, No Call, loading, disabled, focus, selected, and error states are covered.
- Recommendation, Trust Layer, risk toggle, table, and CTA patterns preserve Decision Layer principles.
