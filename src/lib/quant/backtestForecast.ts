import { forecastPrice } from "./forecastPrice";

/**
 * Rolling walk-forward backtest of the statistical forecast.
 *
 * For each historical date t, the model is fitted only on closes up to t−1
 * and asked to predict the close at t (1 trading day ahead). Comparing that
 * prediction with the actual close shows how accurate the forecast has been
 * on every date visible in the chart.
 */

export interface BacktestPoint {
  /** Trading date being predicted ("YYYY-MM-DD"). */
  date: string;
  /** 1-day-ahead prediction made with data up to the previous day. */
  predicted: number;
  actual: number;
  /** |predicted − actual| / actual × 100 */
  errorPct: number;
}

export interface BacktestResult {
  points: BacktestPoint[];
  /** Mean absolute percentage error across all points. */
  mapePct: number;
  /** % of days where the predicted up/down direction matched the actual move. */
  directionHitRatePct: number | null;
  count: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function backtestForecast(
  history: { date: string; close: number }[],
): BacktestResult | null {
  const points: BacktestPoint[] = [];
  let directionHits = 0;
  let directionTotal = 0;

  const closes = history.map((h) => h.close);

  for (let i = 1; i < history.length; i++) {
    // Fit only on data available before date i (forecastPrice enforces
    // its own 20-point minimum and returns null below it)
    const fitted = forecastPrice(closes.slice(0, i), 1);
    if (!fitted) continue;

    const predicted = fitted.expectedPrice;
    const actual = closes[i];
    const prevClose = closes[i - 1];

    points.push({
      date: history[i].date,
      predicted: round2(predicted),
      actual: round2(actual),
      errorPct: round2((Math.abs(predicted - actual) / actual) * 100),
    });

    const predictedMove = predicted - prevClose;
    const actualMove = actual - prevClose;
    if (predictedMove !== 0 && actualMove !== 0) {
      directionTotal++;
      if (Math.sign(predictedMove) === Math.sign(actualMove)) directionHits++;
    }
  }

  if (points.length === 0) return null;

  const mapePct = round2(
    points.reduce((sum, p) => sum + p.errorPct, 0) / points.length,
  );

  return {
    points,
    mapePct,
    directionHitRatePct:
      directionTotal > 0 ? Math.round((directionHits / directionTotal) * 100) : null,
    count: points.length,
  };
}
