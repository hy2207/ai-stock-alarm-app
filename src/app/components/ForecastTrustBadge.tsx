/**
 * Plain-language trust indicator for the statistical forecast.
 *
 * Shows band coverage ("how often the actual price stayed inside the
 * predicted range") instead of point-error metrics, which read as failure
 * to non-expert users even when the model behaves normally. Below 10
 * samples no percentage is shown — small-sample rates (e.g. 0% of 3 days)
 * destroy trust without being statistically meaningful.
 */

const MIN_SAMPLE_DAYS = 10;

interface ForecastTrustBadgeProps {
  /** Number of backtested days. */
  count: number;
  /** Days where the actual close landed inside the predicted range. */
  hits: number;
}

export function ForecastTrustBadge({ count, hits }: ForecastTrustBadgeProps) {
  if (count < MIN_SAMPLE_DAYS) {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
        <span className="text-sm">⏳</span>
        <p className="text-xs text-slate-500">
          예측 신뢰도 데이터를 모으고 있어요{" "}
          <span className="text-slate-400">
            (지금까지 {count}일치 · {MIN_SAMPLE_DAYS}일치가 모이면 적중률이 표시돼요)
          </span>
        </p>
      </div>
    );
  }

  const rate = Math.round((hits / count) * 100);
  const tone =
    rate >= 70
      ? { box: "bg-emerald-50", text: "text-emerald-800", sub: "text-emerald-600", icon: "✅" }
      : rate >= 50
        ? { box: "bg-amber-50", text: "text-amber-800", sub: "text-amber-600", icon: "⚠️" }
        : { box: "bg-rose-50", text: "text-rose-800", sub: "text-rose-600", icon: "❗" };

  return (
    <div className={`mt-2 rounded-lg px-3 py-2 ${tone.box}`}>
      <p className={`text-xs font-semibold ${tone.text}`}>
        {tone.icon} 예측 신뢰도 {rate}%
        <span className="ml-1.5 font-normal">
          — 최근 {count}일 중 {hits}일 적중
        </span>
      </p>
      <p className={`mt-0.5 text-[11px] ${tone.sub}`}>
        실제 가격이 예측 범위 안에 들어온 비율이에요
      </p>
    </div>
  );
}
