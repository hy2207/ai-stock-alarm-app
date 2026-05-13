---
description: US stock Decision Layer — PRD/SRS vision, ADRs, scope
globs: ["**/*"]
alwaysApply: true
---
# Project: US Stock Risk-Adaptive Decision Interface

**Authoritative docs:** `docs/PRD_v1.md`, `docs/SRS-v1.md`. **Cross-tool rules:** `AGENTS.md`.

## Vision
Help busy retail investors get **actionable numbers** (direction, price/range, hold days, risk mode) from **1–3 cards** per day—not more charts or news volume. **Decision Layer** output, not a summarizer (ADR-001).

## Non-negotiables (ADR)
- **ADR-002:** Confidence / risk mode is **user-controlled** (aggressive | balanced | conservative); not a decorative badge.
- **ADR-003:** **3–5 business day** swing context; no tick-scalping in v1.
- **ADR-004:** **No** candlestick, RSI, MACD, etc. in the **main fold** of recommendation detail.
- **ADR-005:** **Trust layer** shows recent prediction performance including **losses** when data exists.
- **ADR-001 / PRD:** No auto-broker execution, no community/UGC in v1.

## Product gate (before adding features)
PRD §1.6 — if **≥2** of the five questions lean “no”, default to **defer**.

## North-star metric
**NS-01 ADR** and supporting events (SRS REQ-FUNC-060, PostHog).

## Personas (short)
Busy US-market retail (KR timezone), chart-weak but news-heavy, skeptical of black-box tips—needs **speed**, **executable prices**, **explainability**, **honest track record**.
