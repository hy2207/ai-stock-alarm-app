# Recommendation Risk Mode Fix Log - 2026-06-23

## Scope

This log summarizes the work done on 2026-06-23 to fix recommendation card behavior around user risk modes, current price display, Korean news rationale, watchlist rendering, Magnificent 7 selection, and local dev refresh stability.

Authoritative product interpretation used for this work:

- The app is a Decision Layer, not a generic news or chart app.
- A user should see 1-3 actionable recommendation cards.
- Each selected ticker should have three risk-mode variants when generated:
  - `aggressive`
  - `balanced`
  - `conservative`
- Risk mode must not change the underlying ticker thesis or consensus target price.
- Risk mode changes the investor's actual sell/exit threshold.

## Timeline Summary

### 1. Recommendation Card Data Contract

Added recommendation fields required by the updated card UX:

- `currentPrice`
- `newsRationaleKo`

Files and migrations:

- `prisma/schema.prisma`
- `prisma/migrations/20260623050000_add_recommendation_news_rationale/migration.sql`
- `prisma/migrations/20260623060000_add_recommendation_current_price/migration.sql`
- `src/lib/dto/recommendationCard.ts`
- `src/lib/dto/llmOutput.ts`
- `src/lib/dto/todayRecommendations.ts`
- Related DTO tests

UI now shows:

- Current price instead of treating entry price as current price.
- Korean compact news rationale.
- `매도 기준가` instead of `손절가` / `손절/청산가`.

### 2. Risk Mode UX

Added a client-side risk mode selector:

- `src/app/components/RiskModeRecommendationList.tsx`

Behavior:

- User can switch between `안정형`, `중립형`, and `공격형`.
- The selected mode is saved through `saveRiskProfile`.
- Home page displays the card variant matching the selected risk mode.
- Missing ticker variants render a No Call placeholder instead of silently disappearing.

Risk-mode copy was updated to reflect the current product meaning:

- 안정형: sells earlier to protect gains.
- 중립형: uses a middle sell threshold.
- 공격형: can hold longer despite BUY or SELL risk signals.

### 3. Watchlist Display Fix

Issue observed:

- User selected three watchlist tickers, but only two appeared on the home screen.

Fix:

- Home page now passes the selected watchlist tickers into the recommendation list.
- The list renders up to three watchlist slots.
- If no valid recommendation exists for a selected ticker, the app renders a No Call card for that ticker.

Files:

- `src/app/page.tsx`
- `src/app/components/RiskModeRecommendationList.tsx`
- `src/lib/queries/getTodayRecommendations.ts`

### 4. Magnificent 7 Watchlist Options

Watchlist choices were expanded to all Magnificent 7 names:

- AAPL
- MSFT
- GOOGL
- AMZN
- NVDA
- META
- TSLA

Files:

- `src/lib/constants/watchlistOptions.ts`
- `src/lib/constants/__tests__/watchlistOptions.test.ts`

The app still keeps the recommendation-card surface constrained to 1-3 selected tickers per SRS/PRD intent.

### 5. Target Price vs Sell Price Concept

Several iterations clarified the product meaning:

- `targetPrice` is the news/analyst thesis price and must be identical across all three risk modes for the same ticker.
- Risk mode must not make the target price higher or lower.
- `stopPrice` is retained as the DB/API field name, but the product meaning is now actual sell/exit price.
- The UI labels this value as `매도 기준가`.

Final rule:

```text
For both BUY and SELL:
aggressive sell price > balanced sell price > conservative sell price
```

Reason:

- Aggressive users hold longer.
- Conservative users sell earlier.
- This is true even when the recommendation direction is SELL.

Additional BUY rule:

- Aggressive sell price must be close to the target price or above target price.

SELL interpretation:

- A SELL recommendation means the model sees risk/downside.
- Aggressive users may still hold despite that SELL signal.
- Therefore aggressive sell price can be higher than balanced/conservative and can be well above the downside target when the evidence supports waiting for a rebound.

Files updated:

- `src/lib/llm/promptBuilder.ts`
- `src/lib/llm/generateRecommendationCards.ts`
- `src/lib/recommendations/generateRecommendationsForUser.ts`
- `src/lib/queries/getTodayRecommendations.ts`
- Related tests

### 6. LLM Output Validation

The generation schema now rejects invalid risk-mode output.

It enforces:

- Exactly one variant each for:
  - aggressive
  - balanced
  - conservative
- Same ticker across the three variants.
- Same direction across the three variants.
- Same current price across the three variants.
- Same consensus target price across the three variants.
- BUY target is above current price.
- SELL target is below current price.
- Sell price order:

```text
aggressive > balanced > conservative
```

For BUY, aggressive sell price must also be near or above the target.

Tests added/updated:

- Reject BUY variants where aggressive sell price is lower than conservative.
- Reject BUY variants where aggressive sell price is ordered but far below target.
- Accept SELL variants only when aggressive sell price is highest.
- Reject SELL variants where aggressive sell price is lowest.

### 7. Existing Bad Card Filtering

Local DB still contained previously generated bad cards, for example:

```json
{
  "ticker": "NVDA",
  "direction": "BUY",
  "aggressiveStop": 200,
  "balancedStop": 203,
  "conservativeStop": 206
}
```

This is invalid because BUY should have:

```text
aggressive > balanced > conservative
```

Another issue:

- Previously generated variants also had different target prices by risk mode.

Fix:

- `getTodayRecommendations()` now filters out invalid saved risk-mode sets before returning cards to the UI.
- If saved cards exist but fail the current risk-mode contract, the response becomes No Call with:

```text
Today's recommendations need regeneration because saved risk-mode prices are outdated.
```

This prevents stale invalid DB data from continuing to appear on the home screen.

### 8. Local Dev Hard Refresh Fix

Issue observed:

Hard refresh with `Ctrl+Shift+R` caused dev static files to 404, breaking CSS/JS:

```text
GET /_next/static/chunks/webpack.js?v=... 404
GET /_next/static/css/app/layout.css?v=... 404
```

Root cause:

- Next dev can receive browser requests for generated static assets before those files are ready.
- The first fix only handled `webpack.js`; CSS still failed.

Fix:

- Replaced `npm run dev` from direct `next dev` to a local wrapper:

```json
"dev": "node scripts/dev-server.mjs"
```

- Added `scripts/dev-server.mjs`.
- The wrapper:
  - Finds an available dev port.
  - Clears only `.next/cache/webpack`.
  - Warms `/login` before printing Ready.
  - Serves `/_next/static/*` from `.next/static/*`.
  - Waits briefly for static files to exist before responding.
  - Serves CSS/JS/JSON with correct content types.

Verified static requests:

```text
/_next/static/css/app/layout.css?v=1782203425419 -> 200 text/css
/_next/static/chunks/webpack.js?v=1782201307314 -> 200 application/javascript
```

Files:

- `package.json`
- `scripts/dev-server.mjs`

## Verification Results

Commands run during the final verification cycle:

```bash
npm run typecheck
DATABASE_URL=file:./dev.db npm test
npm run build
node --check scripts/dev-server.mjs
```

Final confirmed results:

- Typecheck passed.
- Full test suite passed:
  - 55 test files
  - 465 tests
- Production build passed.
- Dev wrapper syntax check passed.
- Dev static CSS/JS requests returned 200 after wrapper changes.

## Current State

- Recommendation cards support current price and Korean news rationale.
- Home page supports risk-mode switching.
- Watchlist rendering no longer drops selected tickers silently.
- Magnificent 7 options are available in settings/onboarding.
- Target price is treated as one shared news/analyst thesis across risk modes.
- `stopPrice` is now product-interpreted and UI-labeled as `매도 기준가`.
- For both BUY and SELL, aggressive sell price must be highest.
- Existing invalid saved card sets are hidden and marked for regeneration.
- Local hard refresh should no longer break CSS/JS due to missing `/_next/static/*` assets.

## Known Follow-Ups

1. Regenerate today's recommendations locally.
   - Current local DB contains old invalid cards.
   - The UI should now hide them until regeneration.

2. Visually verify the home page after regeneration.
   - Confirm TSLA SELL cards show aggressive sell price higher than balanced and conservative.
   - Confirm BUY cards show the same order.
   - Confirm all three selected watchlist slots appear.

3. Consider renaming the DB field later.
   - The database field is still `stopPrice`.
   - The product-facing term is now `매도 기준가`.
   - A future migration could rename the field to `exitPrice` or `sellPrice`, but that was deferred to keep this fix scoped.

4. Re-check generated LLM quality.
   - The prompt now clearly defines risk modes.
   - Still, generated Korean rationales should be reviewed for compactness and evidence grounding.
