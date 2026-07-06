/**
 * Statistical price forecast from daily close prices — no LLM involved.
 *
 * Component lookbacks (agreed criteria):
 *   - Trend (point forecast): last TREND_WINDOW trading days, so the forecast
 *     tracks the current price regime. Holt double exponential smoothing and
 *     linear regression, averaged as an ensemble.
 *   - Volatility (±band): up to VOL_WINDOW trading days of log returns with
 *     EWMA weighting (RiskMetrics λ=0.94) — longer window stabilises the band
 *     while EWMA still weights recent moves.
 *   - Below MIN_POINTS valid closes, no forecast is produced (null).
 */

const TREND_WINDOW = 21; // ~1 month of trading days
const VOL_WINDOW = 63; // ~3 months of trading days
const MIN_POINTS = 20;

const HOLT_ALPHA = 0.5;
const HOLT_BETA = 0.3;
const EWMA_LAMBDA = 0.94;

export interface PriceForecast {
  /** Ensemble point forecast at horizonDays. */
  expectedPrice: number;
  /** expectedPrice − 1σ (≈68% band lower edge). */
  lowBand: number;
  /** expectedPrice + 1σ (≈68% band upper edge). */
  highBand: number;
  /** Regression slope as % of last close per trading day. */
  trendSlopePctPerDay: number;
  /** Regression fit quality 0–1 (1 = perfectly linear trend). */
  trendR2: number;
  /** EWMA daily volatility of log returns, in %. */
  dailyVolatilityPct: number;
  horizonDays: number;
  method: "holt+linreg";
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Holt double exponential smoothing point forecast `horizon` steps ahead. */
export function holtForecast(
  closes: number[],
  horizon: number,
  alpha = HOLT_ALPHA,
  beta = HOLT_BETA,
): number {
  let level = closes[0];
  let trend = closes[1] - closes[0];

  for (let i = 1; i < closes.length; i++) {
    const prevLevel = level;
    level = alpha * closes[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  return level + horizon * trend;
}

/** Least-squares line fit over closes; forecast + slope + R². */
export function linearTrendForecast(
  closes: number[],
  horizon: number,
): { forecast: number; slope: number; r2: number } {
  const n = closes.length;
  const xMean = (n - 1) / 2;
  const yMean = closes.reduce((a, b) => a + b, 0) / n;

  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = i - xMean;
    const dy = closes[i] - yMean;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }

  const slope = sxy / sxx;
  const intercept = yMean - slope * xMean;
  // A perfectly flat series is a perfect fit for the zero-slope line
  const r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy);

  return { forecast: intercept + slope * (n - 1 + horizon), slope, r2 };
}

/** EWMA daily volatility (std dev of log returns), RiskMetrics style. */
export function ewmaDailyVolatility(closes: number[], lambda = EWMA_LAMBDA): number {
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    returns.push(Math.log(closes[i] / closes[i - 1]));
  }
  if (returns.length === 0) return 0;

  let variance = returns[0] * returns[0];
  for (let i = 1; i < returns.length; i++) {
    variance = lambda * variance + (1 - lambda) * returns[i] * returns[i];
  }
  return Math.sqrt(variance);
}

/**
 * Forecast the price `horizonDays` trading days ahead.
 *
 * @param closes daily close prices, oldest → newest (calendar gaps are fine —
 *   indices are treated as consecutive trading days)
 * @returns forecast, or null when there is not enough usable data
 */
export function forecastPrice(
  closes: number[],
  horizonDays: number,
): PriceForecast | null {
  if (!Number.isInteger(horizonDays) || horizonDays < 1) return null;

  const valid = closes.filter((c) => Number.isFinite(c) && c > 0);
  if (valid.length < MIN_POINTS) return null;

  const trendCloses = valid.slice(-TREND_WINDOW);
  const volCloses = valid.slice(-VOL_WINDOW);
  const lastClose = valid[valid.length - 1];

  const holt = holtForecast(trendCloses, horizonDays);
  const { forecast: linreg, slope, r2 } = linearTrendForecast(trendCloses, horizonDays);
  const expectedPrice = (holt + linreg) / 2;

  // A non-positive forecast means the trend extrapolation broke down
  if (!Number.isFinite(expectedPrice) || expectedPrice <= 0) return null;

  const dailyVol = ewmaDailyVolatility(volCloses);
  const horizonSigma = dailyVol * Math.sqrt(horizonDays);

  return {
    expectedPrice: round2(expectedPrice),
    lowBand: round2(expectedPrice * (1 - horizonSigma)),
    highBand: round2(expectedPrice * (1 + horizonSigma)),
    trendSlopePctPerDay: round3((slope / lastClose) * 100),
    trendR2: round3(Math.max(0, Math.min(1, r2))),
    dailyVolatilityPct: round3(dailyVol * 100),
    horizonDays,
    method: "holt+linreg",
  };
}
