# UX-016 Design QA & Usability Handoff

## Release Gate Checks
- Main recommendation detail fold does not render candle charts, RSI, MACD, or indicator-first analysis.
- Recommendation card shows direction, executable entry/target price or range, holdDays, confidence/risk mode, and reasonLine.
- Confidence control exposes conservative, balanced, aggressive modes and changes card output without another LLM call.
- Card and detail surfaces include the investment disclaimer.
- Trust Layer shows success and failure records when data exists; empty state says data is accumulating.
- No Call, loading, empty, error, login-required, and push-permission states do not expose raw 5xx messages.

## Accessibility Checks
- Keyboard can reach primary actions: confidence modes, detail, price copy, broker redirect, alert, settings.
- Interactive controls have visible focus states.
- Text contrast is readable on white, slate, amber, green, red, and blue surfaces.
- Touch targets are at least 44px on mobile.
- Icon-only controls require accessible labels or nearby text.

## Responsive Checks
- Mobile and desktop layouts do not overlap, clip text, or hide primary decision fields.
- Recommendation cards remain scannable at narrow widths.
- Bottom/mobile navigation does not cover CTA buttons or disclaimer text.

## Usability Test Tasks
- Task 1: user chooses a risk mode and identifies the changed price or hold horizon.
- Task 2: user copies an entry price.
- Task 3: user opens a recommendation detail and finds success/failure history.
- Task 4: user reaches settings and changes watchlist within the 1-3 item limit.
- Task 5: user understands a No Call state without treating it as an error.

## Acceptance Targets
- Task completion rate: 80% or higher for tasks 1-4.
- No critical ADR violations: chart-first detail, missing disclaimer, hidden failures, or passive-only confidence badge.
- Any failed accessibility or release gate check blocks issue close.
