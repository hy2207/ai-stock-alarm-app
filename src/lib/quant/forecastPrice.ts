/**
 * Statistical price forecast from daily bars — no LLM involved.
 *
 * Components:
 *   - Point forecast: damped-trend Holt exponential smoothing + linear
 *     regression (damped extrapolation) ensemble over the last TREND_WINDOW
 *     trading days, damped (φ=0.85) and shrunk toward the last close
 *     (w=0.3) — daily prices are near-random-walk, and un-shrunk trend
 *     extrapolation was the dominant error source on real data.
 *   - ±Band (calibrated): conformal prediction — the band half-width is the
 *     80% quantile of this series' own recent walk-forward 1-day point
 *     errors, scaled by √horizon. Distribution-free, so fat tails and regime
 *     shifts are absorbed automatically. The σ floor uses Yang-Zhang OHLC
 *     volatility when bars carry OHLC (falling back to close-to-close EWMA).
 *   - Below MIN_POINTS valid closes, no forecast is produced (null).
 */

const TREND_WINDOW = 21; // ~1 month of trading days
const VOL_WINDOW = 63; // ~3 months of trading days
/** Exported so UI can explain why a forecast is missing (e.g. new listings). */
export const MIN_POINTS = 20;

const HOLT_ALPHA = 0.5;
const HOLT_BETA = 0.3;
/** Trend damping (Gardner-McKenzie). φ<1 keeps short-run trend but stops
 *  runaway extrapolation — daily equity drift is mostly noise. */
const HOLT_PHI = 0.85;
/** Shrinkage toward the random walk: expected = w·trend + (1−w)·lastClose.
 *  Daily prices are near-random-walk; validated on stored M7 history where
 *  full trend weight underperformed the RW baseline. */
const TREND_WEIGHT = 0.3;
const EWMA_LAMBDA = 0.94;

/** Conformal calibration: target coverage and minimum error samples. */
const CONFORMAL_COVERAGE = 0.8;
const CONFORMAL_MIN_SAMPLES = 5;
/** Normal quantile for 80% two-sided coverage — sizes the σ fallback/floor. */
const Z_80 = 1.28;
/** Yang-Zhang needs at least this many bars with full OHLC. */
const YZ_MIN_SAMPLES = 10;

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

/** Damped-trend Holt exponential smoothing forecast `horizon` steps ahead. */
export function holtForecast(
  closes: number[],
  horizon: number,
  alpha = HOLT_ALPHA,
  beta = HOLT_BETA,
  phi = HOLT_PHI,
): number {
  let level = closes[0];
  let trend = closes[1] - closes[0];

  for (let i = 1; i < closes.length; i++) {
    const prevLevel = level;
    level = alpha * closes[i] + (1 - alpha) * (level + phi * trend);
    trend = beta * (level - prevLevel) + (1 - beta) * phi * trend;
  }

  // Damped horizon: Σ φ^i for i=1..h instead of h
  let dampedSteps = 0;
  for (let i = 1; i <= horizon; i++) dampedSteps += Math.pow(phi, i);
  return level + dampedSteps * trend;
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

  // Extrapolate with the same damped horizon as Holt so the ensemble
  // members share one trend philosophy
  let dampedSteps = 0;
  for (let i = 1; i <= horizon; i++) dampedSteps += Math.pow(HOLT_PHI, i);

  return { forecast: intercept + slope * (n - 1) + slope * dampedSteps, slope, r2 };
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
 * Yang-Zhang daily volatility from OHLC bars — combines overnight,
 * open-to-close, and Rogers-Satchell range components. ~8× more sample-
 * efficient than close-to-close, which matters for our 20–60 day windows.
 * Returns null when too few bars carry full OHLC data.
 */
export function yangZhangDailyVolatility(bars: ForecastBar[]): number | null {
  const overnight: number[] = [];
  const openToClose: number[] = [];
  const rogersSatchell: number[] = [];

  for (let i = 1; i < bars.length; i++) {
    const b = bars[i];
    const prevClose = bars[i - 1].close;
    if (
      b.open == null || b.high == null || b.low == null ||
      !(b.open > 0) || !(b.high > 0) || !(b.low > 0) || !(prevClose > 0)
    ) {
      continue;
    }
    const o = Math.log(b.open / prevClose);
    const c = Math.log(b.close / b.open);
    const u = Math.log(b.high / b.open);
    const d = Math.log(b.low / b.open);
    overnight.push(o);
    openToClose.push(c);
    rogersSatchell.push(u * (u - c) + d * (d - c));
  }

  const n = overnight.length;
  if (n < YZ_MIN_SAMPLES) return null;

  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const sampleVar = (a: number[]) => {
    const m = mean(a);
    return a.reduce((sum, x) => sum + (x - m) * (x - m), 0) / (a.length - 1);
  };

  const k = 0.34 / (1.34 + (n + 1) / (n - 1));
  const variance =
    sampleVar(overnight) + k * sampleVar(openToClose) + (1 - k) * mean(rogersSatchell);

  return variance > 0 ? Math.sqrt(variance) : null;
}

/** Point forecast: damped Holt + linreg ensemble, shrunk toward the last
 *  close (random-walk anchor). */
export function ensemblePointForecast(closes: number[], horizon: number): number {
  const trendCloses = closes.slice(-TREND_WINDOW);
  const holt = holtForecast(trendCloses, horizon);
  const { forecast: linreg } = linearTrendForecast(trendCloses, horizon);
  const trendForecast = (holt + linreg) / 2;
  const lastClose = closes[closes.length - 1];
  return TREND_WEIGHT * trendForecast + (1 - TREND_WEIGHT) * lastClose;
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

  const { slope, r2 } = linearTrendForecast(trendCloses, horizonDays);
  const expectedPrice = ensemblePointForecast(closes, horizonDays);

  // A non-positive forecast means the trend extrapolation broke down
  if (!Number.isFinite(expectedPrice) || expectedPrice <= 0) return null;

  const volBars = bars.slice(-VOL_WINDOW);
  const yzVol = yangZhangDailyVolatility(volBars);
  const dailyVol = yzVol ?? ewmaDailyVolatility(volCloses);

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
    method = yzVol != null ? "ensemble+conformal80+yz" : "ensemble+conformal80";
  } else {
    halfWidth = sigmaFloor;
    method = yzVol != null ? "ensemble+sigma80+yz" : "ensemble+sigma80";
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
