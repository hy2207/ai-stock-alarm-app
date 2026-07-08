/**
 * Statistical price forecast from daily bars — no LLM involved.
 *
 * Components:
 *   - Point forecast: Holt double exponential smoothing + linear regression
 *     ensemble over the last TREND_WINDOW trading days.
 *   - ±Band (calibrated): conformal prediction — the band half-width is the
 *     80% quantile of this series' own recent walk-forward 1-day point
 *     errors, scaled by √horizon. Distribution-free, so fat tails and regime
 *     shifts are absorbed automatically. Falls back to an EWMA σ band when
 *     there are not enough walk-forward samples yet.
 *   - Below MIN_POINTS valid closes, no forecast is produced (null).
 */

const TREND_WINDOW = 21; // ~1 month of trading days
const VOL_WINDOW = 63; // ~3 months of trading days
const MIN_POINTS = 20;

const HOLT_ALPHA = 0.5;
const HOLT_BETA = 0.3;
const EWMA_LAMBDA = 0.94;

/** Conformal calibration: target coverage and minimum error samples. */
const CONFORMAL_COVERAGE = 0.8;
const CONFORMAL_MIN_SAMPLES = 5;
/** Normal quantile for 80% two-sided coverage — sizes the σ fallback/floor. */
const Z_80 = 1.28;

/** Daily bar input. OHLC fields are optional (used by range-based vol). */
export interface ForecastBar {
  close: number;
  open?: number | null;
  high?: number | null;
  low?: number | null;
}

export interface PriceForecast {
  /** Ensemble point forecast at horizonDays. */
  expectedPrice: number;
  /** Calibrated band lower edge (~80% empirical coverage). */
  lowBand: number;
  /** Calibrated band upper edge (~80% empirical coverage). */
  highBand: number;
  /** Regression slope as % of last close per trading day. */
  trendSlopePctPerDay: number;
  /** Regression fit quality 0–1 (1 = perfectly linear trend). */
  trendR2: number;
  /** Daily volatility of log returns, in % (EWMA). */
  dailyVolatilityPct: number;
  horizonDays: number;
  /** Band source: conformal (error-calibrated) or sigma fallback. */
  method: string;
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

/** Ensemble point forecast over the trend window (Holt + linreg average). */
export function ensemblePointForecast(closes: number[], horizon: number): number {
  const trendCloses = closes.slice(-TREND_WINDOW);
  const holt = holtForecast(trendCloses, horizon);
  const { forecast: linreg } = linearTrendForecast(trendCloses, horizon);
  return (holt + linreg) / 2;
}

/**
 * Walk-forward 1-day point-forecast errors over this series, as fractions
 * of the actual close. Feeds the conformal band calibration.
 */
export function walkForwardAbsErrors(closes: number[]): number[] {
  const errors: number[] = [];
  for (let i = MIN_POINTS; i < closes.length; i++) {
    const predicted = ensemblePointForecast(closes.slice(0, i), 1);
    if (!Number.isFinite(predicted) || predicted <= 0) continue;
    errors.push(Math.abs(predicted - closes[i]) / closes[i]);
  }
  return errors;
}

/** Conformal quantile: the ⌈(n+1)·q⌉-th order statistic. */
export function conformalQuantile(samples: number[], coverage: number): number {
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((sorted.length + 1) * coverage) - 1);
  return sorted[Math.max(0, idx)];
}

function toBars(input: ForecastBar[] | number[]): ForecastBar[] {
  return input.map((v) => (typeof v === "number" ? { close: v } : v));
}

/**
 * Forecast the price `horizonDays` trading days ahead.
 *
 * @param input daily bars (or plain closes), oldest → newest
 * @returns forecast, or null when there is not enough usable data
 */
export function forecastPrice(
  input: ForecastBar[] | number[],
  horizonDays: number,
): PriceForecast | null {
  if (!Number.isInteger(horizonDays) || horizonDays < 1) return null;

  const bars = toBars(input).filter(
    (b) => Number.isFinite(b.close) && b.close > 0,
  );
  if (bars.length < MIN_POINTS) return null;

  const closes = bars.map((b) => b.close);
  const trendCloses = closes.slice(-TREND_WINDOW);
  const volCloses = closes.slice(-VOL_WINDOW);
  const lastClose = closes[closes.length - 1];

  const holt = holtForecast(trendCloses, horizonDays);
  const { forecast: linreg, slope, r2 } = linearTrendForecast(trendCloses, horizonDays);
  const expectedPrice = (holt + linreg) / 2;

  // A non-positive forecast means the trend extrapolation broke down
  if (!Number.isFinite(expectedPrice) || expectedPrice <= 0) return null;

  const dailyVol = ewmaDailyVolatility(volCloses);

  // ── Band: conformal calibration from this series' own recent errors ──────
  // σ floor targets the same 80% coverage (z=1.28 under normality); the
  // conformal quantile can only widen it, never narrow below the floor —
  // small early samples underestimate tail risk.
  const errors = walkForwardAbsErrors(closes.slice(-VOL_WINDOW - MIN_POINTS));
  const sigmaFloor = Z_80 * dailyVol * Math.sqrt(horizonDays);
  let halfWidth: number;
  let method: string;

  if (errors.length >= CONFORMAL_MIN_SAMPLES) {
    const conformal =
      conformalQuantile(errors, CONFORMAL_COVERAGE) * Math.sqrt(horizonDays);
    halfWidth = Math.max(conformal, sigmaFloor);
    method = "ensemble+conformal80";
  } else {
    halfWidth = sigmaFloor;
    method = "ensemble+sigma80";
  }

  return {
    expectedPrice: round2(expectedPrice),
    lowBand: round2(expectedPrice * (1 - halfWidth)),
    highBand: round2(expectedPrice * (1 + halfWidth)),
    trendSlopePctPerDay: round3((slope / lastClose) * 100),
    trendR2: round3(Math.max(0, Math.min(1, r2))),
    dailyVolatilityPct: round3(dailyVol * 100),
    horizonDays,
    method,
  };
}
