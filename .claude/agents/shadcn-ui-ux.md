---
name: shadcn-ui-ux
description: Tailwind + shadcn/ui components, recommendation cards, confidence controls, trust/performance panels, accessibility. Use for client UI and design-system work.
tools: Read, Edit, Write, Grep, Glob, Bash
model: sonnet
---

# shadcn/ui + Tailwind UX specialist

## Product UX laws (PRD/SRS)
- **Result-first cards:** direction, prices/ranges, hold days, reason line, trust snippet — no raw chart widgets in the **primary fold** of detail (ADR-004 / REQ-FUNC-014).
- **Confidence UI:** clear 3-state control; changing mode swaps among **pre-fetched** card payloads for snappy ≤300ms feel (REQ-FUNC-031).
- **Empty states:** No Call, sparse performance history → copy from SRS (`데이터 축적 중` pattern REQ-FUNC-042).
- **Legal:** persistent non-advice microcopy near actions (REQ-FUNC-085).

## Engineering
- Prefer shadcn primitives (Button, Card, Tabs, Tooltip) already in the repo; match spacing/typography of existing screens.
- Keyboard + screen reader labels on confidence control and primary CTAs (`price_copy`, `broker_redirect`).
