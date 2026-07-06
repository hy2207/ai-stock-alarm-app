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

  it("is highly accurate on a clean linear trend", () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 + i * 2);
    const result = backtestForecast(series(closes))!;

    expect(result.mapePct).toBeLessThan(1); // near-perfect on a straight line
    expect(result.directionHitRatePct).toBe(100);
    for (const p of result.points) {
      expect(p.predicted).toBeCloseTo(p.actual, 0);
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
});
