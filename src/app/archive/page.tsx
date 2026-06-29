import Link from "next/link";
import { Disclaimer } from "@/app/components/Disclaimer";
import { PostHogEvent } from "@/app/components/PostHogEvent";
import { DevEvaluationTrigger } from "@/app/components/DevEvaluationTrigger";
import { getArchiveRecords, type ArchiveRecord } from "@/lib/queries/getArchiveRecords";
import { analyzePriceForRecord, type PriceAnalysis } from "@/lib/perf/priceAnalysis";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtPrice(p: number | null): string {
  if (p == null) return "—";
  return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
}

function targetChangePct(entry: number | null, target: number | null): string | null {
  if (entry == null || target == null || entry === 0) return null;
  const pct = ((target - entry) / entry) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

// ─── sub-components (server) ─────────────────────────────────────────────────

function DirectionBadge({ direction }: { direction: string }) {
  const isBuy = direction === "BUY";
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-xs font-bold ${
        isBuy ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      }`}
    >
      {isBuy ? "BUY" : "SELL"}
    </span>
  );
}

function HitBadge({ hitFlag }: { hitFlag: boolean | null }) {
  if (hitFlag === true)
    return (
      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
        성공
      </span>
    );
  if (hitFlag === false)
    return (
      <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        실패
      </span>
    );
  return (
    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
      평가 중
    </span>
  );
}

function PriceRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-blue-700" : ""}`}>{value}</span>
    </div>
  );
}

function DailyPriceTable({
  dailyPrices,
  direction,
  targetPrice,
}: {
  dailyPrices: PriceAnalysis["dailyPrices"];
  direction: string;
  targetPrice: number | null;
}) {
  if (dailyPrices.length === 0) return null;
  const isBuy = direction === "BUY";

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400">
            <th className="pb-1 text-left font-medium">날짜</th>
            <th className="pb-1 text-right font-medium">종가</th>
            <th className="pb-1 text-right font-medium">{isBuy ? "고가" : "저가"}</th>
            <th className="pb-1 text-right font-medium">목표</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {dailyPrices.map((day) => (
            <tr key={day.date} className={day.targetReached ? "bg-emerald-50" : ""}>
              <td className="py-1 text-slate-600">{day.date}</td>
              <td className="py-1 text-right">{fmtPrice(day.close)}</td>
              <td className="py-1 text-right text-slate-500">
                {fmtPrice(isBuy ? day.high : day.low)}
              </td>
              <td className="py-1 text-right">
                {day.targetReached ? (
                  <span className="font-semibold text-emerald-600">✓ 도달</span>
                ) : targetPrice != null ? (
                  <span className="text-slate-400">{fmtPrice(targetPrice)}</span>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PriceAnalysisPanel({
  record,
  analysis,
}: {
  record: ArchiveRecord;
  analysis: PriceAnalysis;
}) {
  const { card } = record;
  const changePct = targetChangePct(card.entryPrice, card.targetPrice);
  const isPositiveGap = analysis.gapToTargetPct != null && analysis.gapToTargetPct <= 0;

  return (
    <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
      {/* Price summary row */}
      <div className="space-y-1.5">
        <PriceRow label="진입가" value={fmtPrice(card.entryPrice)} />
        <PriceRow
          label={`목표가${changePct ? ` (${changePct})` : ""}`}
          value={fmtPrice(card.targetPrice)}
        />
        <PriceRow label="현재가" value={fmtPrice(analysis.currentPrice)} highlight />
      </div>

      {/* Target analysis */}
      {analysis.targetReachedDate ? (
        <p className="mt-2.5 text-xs font-medium text-emerald-600">
          목표가 {analysis.targetReachedDate}에 도달했습니다.
        </p>
      ) : analysis.gapToTargetPct != null ? (
        <p className={`mt-2.5 text-xs ${isPositiveGap ? "text-emerald-600" : "text-slate-500"}`}>
          {isPositiveGap
            ? "목표가 도달"
            : `목표가까지 ${Math.abs(analysis.gapToTargetPct).toFixed(1)}% 남음`}
        </p>
      ) : null}

      {/* Daily price table */}
      <DailyPriceTable
        dailyPrices={analysis.dailyPrices}
        direction={card.direction}
        targetPrice={card.targetPrice}
      />
    </div>
  );
}

// ─── record card ─────────────────────────────────────────────────────────────

function RecordCard({
  record,
  analysis,
}: {
  record: ArchiveRecord;
  analysis: PriceAnalysis | null;
}) {
  const { card } = record;
  const holdWindowLabel = `${fmtDate(card.createdAt)} — ${card.holdDays}일`;

  return (
    <article className="py-4">
      <PostHogEvent
        event="performance_card_view"
        properties={{ recId: record.recId, ticker: record.ticker }}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{record.ticker}</h2>
          <DirectionBadge direction={record.predictedDirection} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{holdWindowLabel}</span>
          <HitBadge hitFlag={record.hitFlag} />
        </div>
      </div>

      {/* Evaluated result */}
      {record.hitFlag !== null && record.realizedReturn !== null ? (
        <p className="mt-1 text-sm text-slate-600">
          실현 수익률:{" "}
          <span
            className={`font-semibold ${record.realizedReturn >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {record.realizedReturn >= 0 ? "+" : ""}
            {record.realizedReturn.toFixed(2)}%
          </span>
        </p>
      ) : null}

      {/* Pending: show price analysis */}
      {record.hitFlag === null && (
        <>
          {analysis ? (
            <PriceAnalysisPanel record={record} analysis={analysis} />
          ) : (
            <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="space-y-1.5">
                <PriceRow label="진입가" value={fmtPrice(card.entryPrice)} />
                <PriceRow label="목표가" value={fmtPrice(card.targetPrice)} />
              </div>
              <p className="mt-2 text-xs text-slate-400">가격 데이터를 불러올 수 없습니다.</p>
            </div>
          )}
        </>
      )}

      {/* Evaluated: also show simplified price info */}
      {record.hitFlag !== null && (
        <div className="mt-2 flex gap-4 text-xs text-slate-500">
          {card.entryPrice != null && <span>진입가 {fmtPrice(card.entryPrice)}</span>}
          {card.targetPrice != null && <span>목표가 {fmtPrice(card.targetPrice)}</span>}
        </div>
      )}
    </article>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function ArchivePage() {
  const { records, totalCount } = await getArchiveRecords();

  const completed = records.filter((r) => r.hitFlag != null);
  const wins = completed.filter((r) => r.hitFlag === true).length;
  const successRate =
    completed.length > 0 ? Math.round((wins / completed.length) * 100) : null;

  // Fetch price analysis only for pending records
  const pending = records.filter((r) => r.hitFlag === null);
  const pendingCount = pending.length;

  // Deduplicate by ticker+direction+holdDays+createdAt (one fetch per pending record)
  const analysisMap = new Map<string, PriceAnalysis | null>();
  await Promise.all(
    pending.map(async (record) => {
      const analysis = await analyzePriceForRecord(
        record.ticker,
        record.card.direction,
        record.card.targetPrice,
        record.card.createdAt,
        record.card.holdDays,
      );
      analysisMap.set(record.id, analysis);
    }),
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950">
      <div className="mx-auto max-w-3xl py-8">
        <Link href="/" className="text-sm font-medium text-blue-700">
          홈으로
        </Link>

        {/* Summary header */}
        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">추천 이력</h1>
              <p className="mt-1 text-sm text-slate-600">
                성공과 실패를 포함한 최근 성과 기록입니다.
              </p>
            </div>
            <DevEvaluationTrigger pendingCount={pendingCount} />
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-500">총 기록</dt>
              <dd className="font-semibold">{totalCount}</dd>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <dt className="text-slate-500">성공률</dt>
              <dd className="font-semibold text-emerald-700">
                {successRate == null ? "데이터 축적 중" : `${successRate}%`}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-500">평가 중</dt>
              <dd className="font-semibold">{pendingCount}건</dd>
            </div>
          </dl>
        </section>

        {/* Records list */}
        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {records.length === 0 ? (
            <p className="text-sm text-slate-600">데이터 축적 중입니다.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {records.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  analysis={analysisMap.get(record.id) ?? null}
                />
              ))}
            </div>
          )}
        </section>

        <Disclaimer />
      </div>
    </main>
  );
}
