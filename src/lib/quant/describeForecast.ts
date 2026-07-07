/**
 * Plain-language presentation helpers for the statistical forecast.
 * Converts model numbers (slope, R², σ) into words a non-expert can read.
 */

export interface ForecastDirection {
  arrow: "↗" | "↘" | "→";
  label: string;
  /** Tailwind tone key: emerald (up), rose (down), slate (flat). */
  tone: "up" | "down" | "flat";
}

/** % change of the expected price versus the reference (current) price. */
export function forecastChangePct(expectedPrice: number, referencePrice: number): number {
  return ((expectedPrice - referencePrice) / referencePrice) * 100;
}

/** Direction chip: ±0.5% dead zone counts as flat. */
export function describeDirection(changePct: number): ForecastDirection {
  if (changePct >= 0.5) return { arrow: "↗", label: "상승 우세", tone: "up" };
  if (changePct <= -0.5) return { arrow: "↘", label: "하락 우세", tone: "down" };
  return { arrow: "→", label: "보합 전망", tone: "flat" };
}

/** One-line home-card summary, e.g. "약 3% 하락 예상". */
export function shortChangeText(changePct: number): string {
  const abs = Math.abs(changePct);
  if (abs < 0.5) return "큰 변화 없음";
  const rounded = abs >= 10 ? Math.round(abs) : Math.round(abs * 10) / 10;
  return `약 ${rounded}% ${changePct > 0 ? "상승" : "하락"} 예상`;
}

/** Trend clarity in plain words (from regression R²). */
export function trendClarityText(r2: number): string {
  if (r2 >= 0.6) return "추세가 뚜렷해요";
  if (r2 >= 0.3) return "추세가 어느 정도 보여요";
  return "뚜렷한 추세는 없어요";
}

/** Volatility in plain words (from EWMA daily σ in %). */
export function volatilityText(dailyVolatilityPct: number): string {
  if (dailyVolatilityPct >= 3.5) return "가격 움직임이 큰 편이에요";
  if (dailyVolatilityPct >= 1.5) return "가격 움직임은 보통이에요";
  return "가격 움직임이 차분한 편이에요";
}

/** Whole-dollar display for forecast prices — avoids false precision. */
export function fmtForecastPrice(price: number): string {
  return `$${Math.round(price).toLocaleString("en-US")}`;
}

/** Signed % with one decimal, e.g. "+3.5%" / "-10.0%". */
export function fmtSignedPct(pct: number): string {
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}
