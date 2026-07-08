import Link from "next/link";
import { Disclaimer } from "@/app/components/Disclaimer";
import { PostHogEvent } from "@/app/components/PostHogEvent";
import { DevEvaluationTrigger } from "@/app/components/DevEvaluationTrigger";
import { getArchiveCards, computeStats, type ArchiveCard } from "@/lib/queries/getArchiveCards";
import {
  getM7TrustView,
  type M7TrustRecordView,
  type M7TrustSummary,
} from "@/lib/queries/getM7TrustView";
import { M7_TICKERS } from "@/lib/quant/m7Trust";

// ─── types ────────────────────────────────────────────────────────────────────

type ViewKey = "trust" | "history";
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

function fmtWholePrice(p: number): string {
  return `$${Math.round(p).toLocaleString("en-US")}`;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
}

function fmtTrustDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
}

function fmtTrustDateHeading(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  });
}

function daysSince(d: Date): number {
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function groupByDate(records: M7TrustRecordView[]): [string, M7TrustRecordView[]][] {
  const groups = new Map<string, M7TrustRecordView[]>();
  for (const r of records) {
    const list = groups.get(r.targetDate) ?? [];
    list.push(r);
    groups.set(r.targetDate, list);
  }
  // Input is already sorted targetDate desc — Map preserves insertion order
  return Array.from(groups.entries());
}

function filterByTab(cards: ArchiveCard[], tab: TabKey): ArchiveCard[] {
  if (tab === "pending") return cards.filter((c) => c.performance?.hitFlag == null);
  if (tab === "success") return cards.filter((c) => c.performance?.hitFlag === true);
  if (tab === "failure") return cards.filter((c) => c.performance?.hitFlag === false);
  return cards;
}

// ─── AI 예측 정확도 (M7 trust) components ────────────────────────────────────

function TrustSummary({ summary }: { summary: M7TrustSummary }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">AI 예측 정확도</h1>
      <p className="mt-1 text-sm text-slate-500">
        미국 대표 7개 종목(M7)의 다음 날 가격을 매일 예측하고, 실제 종가와
        비교해 그대로 공개합니다.
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-blue-50 p-3">
          <dt className="text-slate-500">평균 오차</dt>
          <dd className="mt-0.5 text-xl font-semibold text-blue-700">
            {summary.avgAbsErrorPct == null ? "—" : `±${summary.avgAbsErrorPct}%`}
          </dd>
          <dd className="mt-0.5 text-[11px] text-slate-400">실제와 예상의 평균 차이</dd>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3">
          <dt className="text-slate-500">범위 적중률</dt>
          <dd className="mt-0.5 text-xl font-semibold text-emerald-700">
            {summary.bandHitRatePct == null ? "—" : `${summary.bandHitRatePct}%`}
          </dd>
          <dd className="mt-0.5 text-[11px] text-slate-400">예상 범위 안에 들어온 비율</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-slate-500">검증 횟수</dt>
          <dd className="mt-0.5 text-xl font-semibold">{summary.evaluatedCount}회</dd>
          <dd className="mt-0.5 text-[11px] text-slate-400">
            대기 {summary.pendingCount}건
          </dd>
        </div>
      </dl>

      {summary.byTicker.length > 0 && (
        <>
          <h2 className="mt-5 text-sm font-semibold text-slate-700">종목별 범위 적중률</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {summary.byTicker.map((t) => (
              <div
                key={t.ticker}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <span className="text-sm font-semibold">{t.ticker}</span>
                <span
                  className={`text-sm font-medium ${
                    t.hitRatePct >= 70
                      ? "text-emerald-600"
                      : t.hitRatePct >= 50
                        ? "text-amber-600"
                        : "text-rose-500"
                  }`}
                >
                  {t.hitRatePct}%
                  <span className="ml-1 text-[10px] font-normal text-slate-400">
                    ({t.hits}/{t.evaluated})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="mt-4 text-xs text-slate-400">
        매일 아침 8시(한국 시간), 미국 장 마감 후 자동으로 검증·기록됩니다.
        통계 모델의 예측이며 투자 자문이 아닙니다.
      </p>
    </section>
  );
}

function TrustRecordRow({ record }: { record: M7TrustRecordView }) {
  const isPending = record.inBand == null;
  const rowTone = isPending
    ? "border-slate-100 bg-slate-50"
    : record.inBand
      ? "border-emerald-100 bg-emerald-50/70"
      : "border-rose-100 bg-rose-50/70";
  const pctTone = isPending
    ? "text-slate-400"
    : record.inBand
      ? "text-emerald-700"
      : "text-rose-600";

  return (
    <div className={`rounded-lg border px-4 py-3 ${rowTone}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{record.ticker}</span>
        {isPending ? (
          <span className="rounded bg-slate-200/70 px-2 py-0.5 text-xs font-medium text-slate-500">
            검증 대기
          </span>
        ) : record.inBand ? (
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            범위 적중
          </span>
        ) : (
          <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">
            범위 이탈
          </span>
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm">
        <span className="text-slate-600">
          예상 {fmtWholePrice(record.predicted)}
          <span className="ml-1 text-xs text-slate-400">
            (범위 {fmtWholePrice(record.bandLow)}–{fmtWholePrice(record.bandHigh)})
          </span>
        </span>
        {record.actualClose != null && record.errorPct != null ? (
          <span className="text-slate-700">
            실제 {fmtWholePrice(record.actualClose)}
            <span className={`ml-1.5 font-semibold ${pctTone}`}>
              {record.errorPct >= 0 ? "+" : ""}
              {record.errorPct.toFixed(1)}%
            </span>
          </span>
        ) : (
          <span className="text-xs text-slate-400">내일 아침 검증됩니다</span>
        )}
      </div>
    </div>
  );
}

// ─── 내 추천 기록 (personal history) components ──────────────────────────────

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
      <div className="h-1 rounded-full bg-blue-400" style={{ width: `${pct}%` }} />
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

      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{card.reasonLine}</p>

      <div className="mt-2 flex gap-4 text-xs text-slate-500">
        {card.entryPrice != null && <span>진입가 {fmtPrice(card.entryPrice)}</span>}
        {card.targetPrice != null && <span>목표가 {fmtPrice(card.targetPrice)}</span>}
        {card.exitPrice != null && <span>손절가 {fmtPrice(card.exitPrice)}</span>}
      </div>

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
  searchParams?: { view?: string; tab?: string; ticker?: string };
}) {
  const view: ViewKey = searchParams?.view === "history" ? "history" : "trust";

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950">
      <div className="mx-auto max-w-3xl py-8">
        {/* ── 뷰 전환 ─────────────────────────────────────────────────────── */}
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
          <Link
            href="/archive"
            className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors ${
              view === "trust"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            AI 예측 정확도
          </Link>
          <Link
            href="/archive?view=history"
            className={`flex-1 rounded-md py-2 text-center text-sm font-medium transition-colors ${
              view === "history"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            내 추천 기록
          </Link>
        </div>

        <div className="mt-4">
          {view === "trust" ? (
            <TrustView selectedTicker={searchParams?.ticker} />
          ) : (
            <HistoryView tab={searchParams?.tab} />
          )}
        </div>

        <Disclaimer />
      </div>
    </main>
  );
}

// ─── trust view (server component) ───────────────────────────────────────────

async function TrustView({ selectedTicker }: { selectedTicker?: string }) {
  const { summary, records } = await getM7TrustView();

  const validTicker = M7_TICKERS.includes(selectedTicker as (typeof M7_TICKERS)[number])
    ? selectedTicker
    : undefined;
  const displayRecords = validTicker
    ? records.filter((r) => r.ticker === validTicker)
    : records;

  return (
    <>
      <PostHogEvent event="home_view" properties={{ state: "m7_trust" }} />
      <TrustSummary summary={summary} />

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold">일별 검증 기록</h2>

        {/* Ticker filter chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Link
            href="/archive"
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              !validTicker
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            전체
          </Link>
          {M7_TICKERS.map((t) => (
            <Link
              key={t}
              href={`/archive?ticker=${t}`}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                validTicker === t
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>

        {displayRecords.length === 0 ? (
          <p className="mt-4 py-4 text-center text-sm text-slate-500">
            아직 기록이 없습니다. 매일 아침 8시에 자동으로 쌓입니다.
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            {groupByDate(displayRecords).map(([date, records]) => {
              const evaluated = records.filter((r) => r.inBand != null);
              const hits = evaluated.filter((r) => r.inBand === true).length;
              return (
                <div key={date}>
                  <div className="mb-2 flex items-baseline justify-between border-b border-slate-100 pb-1.5">
                    <h3 className="text-sm font-semibold text-slate-700">
                      {fmtTrustDateHeading(date)}
                    </h3>
                    {evaluated.length > 0 ? (
                      <span
                        className={`text-xs font-medium ${
                          hits === evaluated.length
                            ? "text-emerald-600"
                            : hits === 0
                              ? "text-rose-500"
                              : "text-slate-500"
                        }`}
                      >
                        {hits}/{evaluated.length} 적중
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">검증 대기</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {records.map((record) => (
                      <TrustRecordRow key={record.id} record={record} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

// ─── history view (server component) ─────────────────────────────────────────

async function HistoryView({ tab }: { tab?: string }) {
  const cards = await getArchiveCards();
  const stats = computeStats(cards);

  const validTab: TabKey = ["all", "pending", "success", "failure"].includes(tab ?? "")
    ? (tab as TabKey)
    : "all";

  const tabCounts: Record<TabKey, number> = {
    all: cards.length,
    pending: stats.pendingCount,
    success: stats.wins,
    failure: stats.losses,
  };

  const displayCards = filterByTab(cards, validTab);

  return (
    <>
      {/* 성과 요약 */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">내 추천 기록</h1>
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
      </section>

      {/* 탭 필터 */}
      <div className="mt-4 flex gap-1 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
        {(["all", "pending", "success", "failure"] as TabKey[]).map((t) => (
          <Link
            key={t}
            href={
              t === "all"
                ? "/archive?view=history"
                : `/archive?view=history&tab=${t}`
            }
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

      {/* 카드 목록 */}
      <section className="mt-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {displayCards.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">
            {validTab === "all"
              ? "추천 이력이 없습니다."
              : `${TAB_LABELS[validTab]} 기록이 없습니다.`}
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayCards.map((card) => (
              <RecordCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
