import { describe, it, expect } from "vitest";
import {
  forecastPrice,
  holtForecast,
  linearTrendForecast,
  ewmaDailyVolatility,
  yangZhangDailyVolatility,
  type ForecastBar,
} from "../forecastPrice";

// ── fixtures ─────────────────────────────────────────────────────────────────

/** Linearly increasing closes: start, start+step, ... (n points). */
function linearSeries(start: number, step: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => start + step * i);
}

/** Flat series with deterministic alternating noise of ±amplitude. */
function noisySeries(base: number, amplitude: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => base + (i % 2 === 0 ? amplitude : -amplitude));
}

// ── forecastPrice: guards ────────────────────────────────────────────────────

describe("forecastPrice — input guards", () => {
  it("returns null with fewer than 20 valid closes", () => {
    expect(forecastPrice(linearSeries(100, 1, 19), 3)).toBeNull();
  });

  it("returns forecast at exactly 20 valid closes", () => {
    expect(forecastPrice(linearSeries(100, 1, 20), 3)).not.toBeNull();
  });

  it("returns null for horizon < 1 or non-integer horizon", () => {
    const closes = linearSeries(100, 1, 30);
    expect(forecastPrice(closes, 0)).toBeNull();
    expect(forecastPrice(closes, -2)).toBeNull();
    expect(forecastPrice(closes, 1.5)).toBeNull();
  });

  it("filters out NaN / non-positive values before counting", () => {
    const closes = [...linearSeries(100, 1, 25), NaN, -5, 0, Infinity];
    const result = forecastPrice(closes, 3);
    expect(result).not.toBeNull();
    // 19 valid + garbage → null
    expect(forecastPrice([...linearSeries(100, 1, 19), NaN, 0], 3)).toBeNull();
  });

  it("random-walk anchor keeps even a steep crash forecast positive", () => {
    const closes = linearSeries(210, -10, 21); // ends at 10, falling 10/day
    const f = forecastPrice(closes, 5);
    expect(f).not.toBeNull();
    expect(f!.expectedPrice).toBeGreaterThan(0);
    expect(f!.expectedPrice).toBeLessThan(10); // still forecasts a decline
  });
});

// ── forecastPrice: direction & shape ─────────────────────────────────────────

describe("forecastPrice — trend direction", () => {
  it("uptrend: expected above last close, positive slope, high R²", () => {
    const closes = linearSeries(100, 1, 30); // ends at 129
    const f = forecastPrice(closes, 3)!;

    expect(f.expectedPrice).toBeGreaterThan(129);
    expect(f.trendSlopePctPerDay).toBeGreaterThan(0);
    expect(f.trendR2).toBeGreaterThan(0.95);
  });

  it("downtrend: expected below last close, negative slope", () => {
    const closes = linearSeries(200, -1, 30); // ends at 171
    const f = forecastPrice(closes, 3)!;

    expect(f.expectedPrice).toBeLessThan(171);
    expect(f.trendSlopePctPerDay).toBeLessThan(0);
  });

  it("flat series: expected ≈ last close, zero slope, R² = 1, zero volatility", () => {
    const closes = Array(30).fill(150);
    const f = forecastPrice(closes, 5)!;

    expect(f.expectedPrice).toBeCloseTo(150, 1);
    expect(f.trendSlopePctPerDay).toBeCloseTo(0, 3);
    expect(f.trendR2).toBe(1);
    expect(f.dailyVolatilityPct).toBe(0);
    expect(f.lowBand).toBeCloseTo(f.expectedPrice, 1);
    expect(f.highBand).toBeCloseTo(f.expectedPrice, 1);
  });

  it("band always brackets the expected price", () => {
    const closes = noisySeries(100, 2, 40);
    const f = forecastPrice(closes, 3)!;

    expect(f.lowBand).toBeLessThanOrEqual(f.expectedPrice);
    expect(f.highBand).toBeGreaterThanOrEqual(f.expectedPrice);
  });
});

// ── forecastPrice: volatility behaviour ──────────────────────────────────────

describe("forecastPrice — volatility band", () => {
  it("noisier series produces a wider band", () => {
    const calm = forecastPrice(noisySeries(100, 0.5, 40), 3)!;
    const wild = forecastPrice(noisySeries(100, 3, 40), 3)!;

    const calmWidth = calm.highBand - calm.lowBand;
    const wildWidth = wild.highBand - wild.lowBand;
    expect(wildWidth).toBeGreaterThan(calmWidth);
  });

  it("longer horizon widens the band (√t scaling)", () => {
    const closes = noisySeries(100, 1, 40);
    const short = forecastPrice(closes, 1)!;
    const long = forecastPrice(closes, 9)!;

    const shortWidth = short.highBand - short.lowBand;
    const longWidth = long.highBand - long.lowBand;
    // √9 = 3× the sigma of a 1-day horizon (bands are around slightly
    // different expected prices, so allow a loose factor)
    expect(longWidth).toBeGreaterThan(shortWidth * 2);
  });

  it("reports metadata fields", () => {
    const f = forecastPrice(linearSeries(100, 0.5, 30), 4)!;
    expect(f.horizonDays).toBe(4);
    expect(f.method).toMatch(/^ensemble\+(conformal80|sigma)$/);
    expect(f.dailyVolatilityPct).toBeGreaterThanOrEqual(0);
  });
});

// ── component functions ──────────────────────────────────────────────────────

describe("holtForecast", () => {
  it("follows a linear trend with damped extrapolation", () => {
    const closes = linearSeries(100, 2, 21); // ends 140, +2/day
    // Damped (φ=0.85): forecast sits between the last close and the
    // undamped continuation (146), never beyond it
    const f = holtForecast(closes, 3);
    expect(f).toBeGreaterThan(140);
    expect(f).toBeLessThan(146);
    expect(f).toBeCloseTo(142.5, 0);
  });

  it("returns last level for a flat series", () => {
    expect(holtForecast(Array(21).fill(80), 5)).toBeCloseTo(80, 5);
  });
});

describe("linearTrendForecast", () => {
  it("recovers the slope and applies damped extrapolation", () => {
    const closes = linearSeries(50, 1.5, 21); // ends 80
    const { forecast, slope, r2 } = linearTrendForecast(closes, 2);

    expect(slope).toBeCloseTo(1.5, 5);
    // Damped: 80 + 1.5·(0.85 + 0.85²) ≈ 82.36 (undamped would be 83)
    expect(forecast).toBeCloseTo(82.36, 1);
    expect(r2).toBeCloseTo(1, 5);
  });

  it("R² is low for pure oscillation", () => {
    const { r2 } = linearTrendForecast(noisySeries(100, 5, 20), 1);
    expect(r2).toBeLessThan(0.1);
  });
});

describe("ewmaDailyVolatility", () => {
  it("is zero for a constant series", () => {
    expect(ewmaDailyVolatility(Array(30).fill(100))).toBe(0);
  });

  it("increases with return magnitude", () => {
    const small = ewmaDailyVolatility(noisySeries(100, 0.5, 30));
    const large = ewmaDailyVolatility(noisySeries(100, 2, 30));
    expect(large).toBeGreaterThan(small);
  });

  it("weights recent returns more than old ones", () => {
    // Same total moves, but volatility concentrated at the end vs the start
    const calmThenWild = [...noisySeries(100, 0.2, 20), ...noisySeries(100, 3, 10)];
    const wildThenCalm = [...noisySeries(100, 3, 10), ...noisySeries(100, 0.2, 20)];

    expect(ewmaDailyVolatility(calmThenWild)).toBeGreaterThan(
      ewmaDailyVolatility(wildThenCalm),
    );
  });
});

describe("yangZhangDailyVolatility", () => {
  function bar(close: number, spreadPct: number): ForecastBar {
    // Symmetric intraday range around the close
    return {
      open: close * (1 - spreadPct / 200),
      high: close * (1 + spreadPct / 100),
      low: close * (1 - spreadPct / 100),
      close,
    };
  }

  it("returns null when bars carry no OHLC", () => {
    const bars = Array.from({ length: 30 }, (_, i) => ({ close: 100 + i }));
    expect(yangZhangDailyVolatility(bars)).toBeNull();
  });

  it("returns null below the minimum OHLC sample count", () => {
    const bars = Array.from({ length: 8 }, () => bar(100, 1));
    expect(yangZhangDailyVolatility(bars)).toBeNull();
  });

  it("wider intraday ranges produce higher volatility at identical closes", () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 + (i % 2 === 0 ? 0.5 : -0.5));
    const narrow = yangZhangDailyVolatility(closes.map((c) => bar(c, 0.5)))!;
    const wide = yangZhangDailyVolatility(closes.map((c) => bar(c, 4)))!;
    expect(wide).toBeGreaterThan(narrow);
  });

  it("captures intraday risk that close-to-close misses", () => {
    // Flat closes but violent intraday swings
    const bars = Array.from({ length: 30 }, () => bar(100, 5));
    const yz = yangZhangDailyVolatility(bars)!;
    const c2c = ewmaDailyVolatility(bars.map((b) => b.close));
    expect(yz).toBeGreaterThan(c2c);
  });
});
