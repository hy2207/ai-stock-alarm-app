import { forecastPrice } from "./forecastPrice";

/**
 * Rolling walk-forward backtest of the statistical forecast.
 *
 * For each historical date t, the model is fitted only on closes up to t−1
 * and asked to predict date t (1 trading day ahead). The user-facing trust
 * metric is band coverage: how often the actual close landed inside the
 * predicted range. Point-error metrics (MAPE, direction) are kept for
 * internal use but are not shown as primary UI — daily noise makes point
 * error look bad even when the model is behaving correctly.
 */

export interface BacktestPoint {
  /** Trading date being predicted ("YYYY-MM-DD"). */
  date: string;
  /** 1-day-ahead point prediction made with data up to the previous day. */
  predicted: number;
  /** Predicted (calibrated) range for the day. */
  bandLow: number;
  bandHigh: number;
  actual: number;
  /** Did the actual close land inside the predicted range? */
  inBand: boolean;
  /** |predicted − actual| / actual × 100 (internal metric). */
  errorPct: number;
}

export interface BacktestResult {
  points: BacktestPoint[];
  count: number;
  /** Days where the actual close fell inside the predicted range. */
  bandHits: number;
  /** bandHits / count × 100, rounded. */
  bandHitRatePct: number;
  /** Mean absolute percentage error (internal metric). */
  mapePct: number;
  /** % of days the predicted direction matched (internal metric). */
  directionHitRatePct: number | null;
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
    const inBand = actual >= fitted.lowBand && actual <= fitted.highBand;

    points.push({
      date: history[i].date,
      predicted: round2(predicted),
      bandLow: round2(fitted.lowBand),
      bandHigh: round2(fitted.highBand),
      actual: round2(actual),
      inBand,
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

  const bandHits = points.filter((p) => p.inBand).length;
  const mapePct = round2(
    points.reduce((sum, p) => sum + p.errorPct, 0) / points.length,
  );

  return {
    points,
    count: points.length,
    bandHits,
    bandHitRatePct: Math.round((bandHits / points.length) * 100),
    mapePct,
    directionHitRatePct:
      directionTotal > 0 ? Math.round((directionHits / directionTotal) * 100) : null,
  };
}
