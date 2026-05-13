---
name: 010-decision-layer-product-gates
description: PRD §1.6 feature gate, ADR checks, and MoSCoW scope before implementing product changes. Use when adding features, UX, or data exposed to users.
---
# Decision Layer product gates

Before implementing a **user-visible** change, walk through:

## PRD §1.6 (five questions)
1. Strengthens the **Decision Layer** (actionable cards vs raw info)?
2. Strengthens **user risk choice**?
3. Fits **3–5 business day** execution context?
4. **Lowers** cognitive load (not more charts/indicators in the main path)?
5. Improves **trust with evidence** (performance, failures, transparency)?

If **two or more** answers are clearly "no" → **stop** and ask for PM/ADR direction.

## MoSCoW alignment
Classify the change against PRD §4.1. **Won't** items (auto order, UGC, portfolio optimizer, heavy XAI dashboard) must not ship as MVP scope creep.

## KPI awareness
Call out which metric moves (NS-01 ADR, CTR, confidence engagement, trust views) and what event names in PostHog would validate it (SRS REQ-FUNC-060).

## References
- `docs/PRD_v1.md` §1.4–1.6, §4.1, §7.6
- `docs/SRS-v1.md` CON-001–008
