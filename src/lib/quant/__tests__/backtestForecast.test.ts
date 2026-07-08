import { describe, it, expect } from "vitest";
import { backtestForecast } from "../backtestForecast";

function series(closes: number[]): { date: string; close: number }[] {
  return closes.map((close, i) => ({
    date: `2026-06-${String(i + 1).padStart(2, "0")}`,
    close,
  }));
}

describe("backtestForecast", () => {
  it("returns null when history is too short for any prediction", () => {
    // forecastPrice needs 20 points; with 20 closes only index 20+ can be
    // predicted, which doesn't exist
    expect(backtestForecast(series(Array(20).fill(100)))).toBeNull();
  });

  it("predicts from index 20 onward and reports one point per date", () => {
    const closes = Array.from({ length: 26 }, (_, i) => 100 + i);
    const result = backtestForecast(series(closes))!;

    expect(result.count).toBe(6); // indices 20..25
    expect(result.points[0].date).toBe("2026-06-21");
    expect(result.points[result.points.length - 1].date).toBe("2026-06-26");
  });

  it("is accurate on a clean linear trend (damped forecasts trail slightly)", () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 + i * 2);
    const result = backtestForecast(series(closes))!;

    // Damping + random-walk shrinkage trade linear-trend accuracy for
    // robustness on real (near-random-walk) prices
    expect(result.mapePct).toBeLessThan(1.5);
    expect(result.directionHitRatePct).toBe(100);
    for (const p of result.points) {
      expect(Math.abs(p.predicted - p.actual)).toBeLessThan(2);
    }
  });

  it("reports larger error on erratic series than on a smooth one", () => {
    const smooth = Array.from({ length: 30 }, (_, i) => 100 + i);
    const erratic = Array.from({ length: 30 }, (_, i) =>
      i % 2 === 0 ? 100 + i : 92 + i,
    );

    const smoothResult = backtestForecast(series(smooth))!;
    const erraticResult = backtestForecast(series(erratic))!;

    expect(erraticResult.mapePct).toBeGreaterThan(smoothResult.mapePct);
  });

  it("computes errorPct against the actual close", () => {
    const closes = Array.from({ length: 25 }, (_, i) => 100 + i);
    const result = backtestForecast(series(closes))!;

    for (const p of result.points) {
      expect(p.errorPct).toBeCloseTo(
        (Math.abs(p.predicted - p.actual) / p.actual) * 100,
        1,
      );
    }
  });

  it("reports band coverage: gently noisy trend stays inside the calibrated range", () => {
    // Mild alternating noise around a trend — realistic and well-covered
    const closes = Array.from(
      { length: 40 },
      (_, i) => 100 + i * 0.5 + (i % 2 === 0 ? 0.8 : -0.8),
    );
    const result = backtestForecast(series(closes))!;

    expect(result.bandHits).toBeGreaterThan(0);
    expect(result.bandHitRatePct).toBeGreaterThanOrEqual(70);
    expect(result.bandHits).toBe(result.points.filter((p) => p.inBand).length);
  });

  it("flags out-of-band days when a shock exceeds the predicted range", () => {
    // Calm series then a single large jump on the final day
    const closes = [
      ...Array.from({ length: 30 }, (_, i) => 100 + i * 0.1 + (i % 2 === 0 ? 0.2 : -0.2)),
      140, // ~+37% shock — far outside any calibrated band
    ];
    const result = backtestForecast(series(closes))!;

    const last = result.points[result.points.length - 1];
    expect(last.inBand).toBe(false);
    expect(result.bandHitRatePct).toBeLessThan(100);
  });

  it("band bounds always bracket the point prediction", () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 + i + (i % 3 === 0 ? 1.5 : -1));
    const result = backtestForecast(series(closes))!;

    for (const p of result.points) {
      expect(p.bandLow).toBeLessThanOrEqual(p.predicted);
      expect(p.bandHigh).toBeGreaterThanOrEqual(p.predicted);
    }
  });
});
