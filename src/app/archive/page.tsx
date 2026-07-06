import Link from "next/link";
import { Disclaimer } from "@/app/components/Disclaimer";
import { PostHogEvent } from "@/app/components/PostHogEvent";
import { DevEvaluationTrigger } from "@/app/components/DevEvaluationTrigger";
import { getArchiveCards, computeStats, type ArchiveCard } from "@/lib/queries/getArchiveCards";

// ─── types ────────────────────────────────────────────────────────────────────

type TabKey = "all" | "pending" | "success" | "failure";

const TAB_LABELS: Record<TabKey, string> = {
  all: "전체",
  pending: "평가 중",
  success: "성공",
  failure: "실패",
};

const CONFIDENCE_LABELS: Record<string, string> = {
  conservative: "안정형",
  balanced: "중립형",
  aggressive: "공격형",
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(p: number | null): string {
  if (p == null) return "—";
  return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
}

function daysSince(d: Date): number {
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function filterByTab(cards: ArchiveCard[], tab: TabKey): ArchiveCard[] {
  if (tab === "pending") return cards.filter((c) => c.performance?.hitFlag == null);
  if (tab === "success") return cards.filter((c) => c.performance?.hitFlag === true);
  if (tab === "failure") return cards.filter((c) => c.performance?.hitFlag === false);
  return cards;
}

// ─── sub-components ──────────────────────────────────────────────────────────

function DirectionBadge({ direction }: { direction: string }) {
  const isBuy = direction === "BUY";
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-xs font-bold ${
        isBuy ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      }`}
    >
      {direction}
    </span>
  );
}

function StatusBadge({ hitFlag }: { hitFlag: boolean | null | undefined }) {
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
    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
      평가 중
    </span>
  );
}

function ProgressBar({ elapsed, total }: { elapsed: number; total: number }) {
  const pct = Math.min((elapsed / total) * 100, 100);
  return (
    <div className="mt-1 h-1 w-full rounded-full bg-slate-100">
      <div
        className="h-1 rounded-full bg-blue-400"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function TickerStatTable({
  rows,
}: {
  rows: { ticker: string; total: number; wins: number; avgReturn: number | null }[];
}) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
            <th className="pb-2 font-medium">종목</th>
            <th className="pb-2 text-right font-medium">추천</th>
            <th className="pb-2 text-right font-medium">성공</th>
            <th className="pb-2 text-right font-medium">승률</th>
            <th className="pb-2 text-right font-medium">평균 수익률</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => {
            const evaluatedForTicker = row.wins + (row.total - row.wins); // total includes pending
            const rate =
              row.total > 0 ? Math.round((row.wins / row.total) * 100) : null;
            return (
              <tr key={row.ticker}>
                <td className="py-2 font-semibold">{row.ticker}</td>
                <td className="py-2 text-right text-slate-600">{row.total}건</td>
                <td className="py-2 text-right text-emerald-600">{row.wins}건</td>
                <td className="py-2 text-right">
                  {rate != null ? `${rate}%` : "—"}
                </td>
                <td
                  className={`py-2 text-right font-medium ${
                    row.avgReturn == null
                      ? "text-slate-400"
                      : row.avgReturn >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                  }`}
                >
                  {row.avgReturn == null
                    ? "—"
                    : `${row.avgReturn >= 0 ? "+" : ""}${row.avgReturn.toFixed(1)}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RecordCard({ card }: { card: ArchiveCard }) {
  const elapsed = Math.min(daysSince(card.createdAt), card.holdDays);
  const isPending = card.performance?.hitFlag == null;
  const isExpiredPending = isPending && daysSince(card.createdAt) >= card.holdDays;
  const riskLabel = CONFIDENCE_LABELS[card.confidenceScore] ?? card.confidenceScore;

  return (
    <article className="py-4">
      <PostHogEvent
        event="performance_card_view"
        properties={{ recId: card.id, ticker: card.ticker }}
      />

      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{card.ticker}</span>
          <DirectionBadge direction={card.direction} />
          <span className="text-xs text-slate-400">{riskLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{fmtDate(card.createdAt)}</span>
          <StatusBadge hitFlag={card.performance?.hitFlag} />
        </div>
      </div>

      {/* AI 판단 근거 */}
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{card.reasonLine}</p>

      {/* Price row */}
      <div className="mt-2 flex gap-4 text-xs text-slate-500">
        {card.entryPrice != null && <span>진입가 {fmtPrice(card.entryPrice)}</span>}
        {card.targetPrice != null && <span>목표가 {fmtPrice(card.targetPrice)}</span>}
        {card.exitPrice != null && <span>손절가 {fmtPrice(card.exitPrice)}</span>}
      </div>

      {/* Evaluated: realized return */}
      {!isPending && card.performance?.realizedReturn != null && (
        <p className="mt-1.5 text-sm">
          실현 수익률{" "}
          <span
            className={`font-semibold ${
              card.performance.realizedReturn >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {card.performance.realizedReturn >= 0 ? "+" : ""}
            {card.performance.realizedReturn.toFixed(2)}%
          </span>
        </p>
      )}

      {/* Pending: hold window progress */}
      {isPending && (
        <div className="mt-2">
          <p className="text-xs text-slate-400">
            {isExpiredPending
              ? `보유 기간 ${card.holdDays}일 만료 — 평가 대기 중`
              : `보유 기간 ${card.holdDays}일 중 ${elapsed}일 경과`}
          </p>
          {!isExpiredPending && <ProgressBar elapsed={elapsed} total={card.holdDays} />}
        </div>
      )}

      {/* Detail link */}
      <div className="mt-2">
        <Link
          href={`/recommendations/${card.id}`}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          상세 보기 →
        </Link>
      </div>
    </article>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function ArchivePage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const cards = await getArchiveCards();
  const stats = computeStats(cards);

  const tab = (searchParams?.tab ?? "all") as TabKey;
  const validTab: TabKey = ["all", "pending", "success", "failure"].includes(tab)
    ? tab
    : "all";

  const tabCounts: Record<TabKey, number> = {
    all: cards.length,
    pending: stats.pendingCount,
    success: stats.wins,
    failure: stats.losses,
  };

  const displayCards = filterByTab(cards, validTab);

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950">
      <div className="mx-auto max-w-3xl py-8">

        {/* ── 성과 요약 ─────────────────────────────────────────────────────── */}
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">추천 이력</h1>
              <p className="mt-1 text-sm text-slate-500">
                성공과 실패를 포함한 AI 추천 성과 기록입니다.
              </p>
            </div>
            <DevEvaluationTrigger pendingCount={stats.pendingCount} />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-500">총 추천</dt>
              <dd className="mt-0.5 text-xl font-semibold">{stats.total}건</dd>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <dt className="text-slate-500">승률</dt>
              <dd className="mt-0.5 text-xl font-semibold text-emerald-700">
                {stats.successRate == null ? "—" : `${stats.successRate}%`}
              </dd>
              {stats.evaluated > 0 && (
                <dd className="mt-0.5 text-xs text-slate-400">
                  {stats.wins}승 {stats.losses}패
                </dd>
              )}
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <dt className="text-slate-500">평균 수익률</dt>
              <dd
                className={`mt-0.5 text-xl font-semibold ${
                  stats.avgReturn == null
                    ? "text-slate-400"
                    : stats.avgReturn >= 0
                      ? "text-emerald-700"
                      : "text-red-600"
                }`}
              >
                {stats.avgReturn == null
                  ? "—"
                  : `${stats.avgReturn >= 0 ? "+" : ""}${stats.avgReturn.toFixed(1)}%`}
              </dd>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <dt className="text-slate-500">평가 중</dt>
              <dd className="mt-0.5 text-xl font-semibold text-amber-700">
                {stats.pendingCount}건
              </dd>
            </div>
          </dl>

          {/* 종목별 성과 테이블 */}
          {stats.byTicker.length > 0 && (
            <>
              <h2 className="mt-5 text-sm font-semibold text-slate-700">종목별 성과</h2>
              <TickerStatTable rows={stats.byTicker} />
            </>
          )}
        </section>

        {/* ── 탭 필터 ──────────────────────────────────────────────────────── */}
        <div className="mt-4 flex gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
          {(["all", "pending", "success", "failure"] as TabKey[]).map((t) => (
            <Link
              key={t}
              href={t === "all" ? "/archive" : `/archive?tab=${t}`}
              className={`flex-1 rounded-md py-1.5 text-center text-sm font-medium transition-colors ${
                validTab === t
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {TAB_LABELS[t]}
              <span
                className={`ml-1 text-xs ${validTab === t ? "text-slate-300" : "text-slate-400"}`}
              >
                {tabCounts[t]}
              </span>
            </Link>
          ))}
        </div>

        {/* ── 카드 목록 ─────────────────────────────────────────────────────── */}
        <section className="mt-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {displayCards.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              {validTab === "all" ? "추천 이력이 없습니다." : `${TAB_LABELS[validTab]} 기록이 없습니다.`}
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {displayCards.map((card) => (
                <RecordCard key={card.id} card={card} />
              ))}
            </div>
          )}
        </section>

        <Disclaimer />
      </div>
    </main>
  );
}
