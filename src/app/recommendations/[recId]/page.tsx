import { notFound } from "next/navigation";
import { Disclaimer } from "@/app/components/Disclaimer";
import { PostHogEvent } from "@/app/components/PostHogEvent";
import { RecommendationActions } from "@/app/components/RecommendationActions";
import { PriceChart } from "@/app/components/PriceChart";
import { getRecommendationDetail } from "@/lib/queries/getRecommendationDetail";
import { syncPriceHistory } from "@/lib/market-data/priceSync";
import { parseNewsItems } from "@/lib/dto/recommendationCard";

interface RecommendationDetailPageProps {
  params: {
    recId: string;
  };
}

function outcomeLabel(hitFlag: boolean | null) {
  if (hitFlag === true) return "성공";
  if (hitFlag === false) return "실패";
  return "평가 중";
}

const CONFIDENCE_LABELS = {
  conservative: "안정형",
  balanced: "중립형",
  aggressive: "공격형",
} as const;

export default async function RecommendationDetailPage({
  params,
}: RecommendationDetailPageProps) {
  const detail = await getRecommendationDetail(params.recId);

  if (!detail) {
    notFound();
  }

  const { card, evidence, performance } = detail;

  const {
    ohlcv: storedOhlcv,
    regularMarketPrice,
    regularMarketTime,
  } = await syncPriceHistory(card.ticker).catch(() => ({
    ohlcv: [],
    regularMarketPrice: null,
    regularMarketTime: null,
  }));

  const ohlcv = storedOhlcv.map((p) => {
    const [, m, day] = p.date.split("-");
    return {
      date: `${parseInt(m, 10)}/${parseInt(day, 10)}`,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
    };
  });

  const newsItems = parseNewsItems(card.newsItems);

  const completed = performance.filter((record) => record.hitFlag != null);
  const wins = completed.filter((record) => record.hitFlag === true).length;
  const losses = completed.filter((record) => record.hitFlag === false).length;
  const successRate = completed.length > 0 ? Math.round((wins / completed.length) * 100) : null;
  const avgReturn =
    performance.length > 0
      ? performance.reduce((sum, record) => sum + (record.realizedReturn ?? 0), 0) /
        performance.length
      : null;

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950">
      <PostHogEvent
        event="rec_detail_view"
        properties={{
          recId: card.id,
          ticker: card.ticker,
          riskMode: card.confidenceScore,
        }}
      />
      <PostHogEvent
        event="performance_card_view"
        properties={{ recId: card.id, ticker: card.ticker, records: performance.length }}
      />

      <div className="mx-auto max-w-3xl py-8">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">{card.ticker}</h1>
              <p className="mt-1 text-sm text-slate-600">
                {CONFIDENCE_LABELS[card.confidenceScore]}
              </p>
            </div>
            <span
              className={
                card.direction === "BUY"
                  ? "rounded-md bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
                  : "rounded-md bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700"
              }
            >
              {card.direction}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-500">현재가</dt>
              <dd className="font-semibold">
                {card.currentPrice != null
                  ? `$${card.currentPrice.toFixed(2)}`
                  : card.entryPrice != null
                    ? `$${card.entryPrice.toFixed(2)}`
                    : `$${card.entryRangeLow?.toFixed(2)}-${card.entryRangeHigh?.toFixed(2)}`}
              </dd>
              <dd className="mt-0.5 text-[10px] text-slate-400">
                {new Intl.DateTimeFormat("ko-KR", {
                  timeZone: "America/New_York",
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }).format(new Date(card.createdAt))} ET 기준
              </dd>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <dt className="text-slate-500">목표가</dt>
              <dd className="font-semibold text-emerald-700">
                {card.targetPrice != null
                  ? `$${card.targetPrice.toFixed(2)}`
                  : `$${card.targetRangeLow?.toFixed(2)}-${card.targetRangeHigh?.toFixed(2)}`}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-500">권장 보유</dt>
              <dd className="font-semibold">{card.holdDays}일</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-500">매도 기준가</dt>
              <dd className="font-semibold">
                {card.exitPrice != null ? `$${card.exitPrice.toFixed(2)}` : "미지정"}
              </dd>
            </div>
          </dl>

          <div className="mt-4 rounded-lg bg-slate-50 p-4">
            <h2 className="font-semibold">한 줄 이유</h2>
            <p className="mt-2 text-sm text-slate-700">{card.reasonLine}</p>
          </div>

          {newsItems.length > 0 ? (
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <h2 className="font-semibold text-blue-950">
                뉴스 기반 판단 근거{" "}
                <span className="text-sm font-normal text-blue-600">
                  ({newsItems.length}건)
                </span>
              </h2>
              <ul className="mt-3 space-y-3">
                {newsItems.map((item, i) => (
                  <li key={i} className="rounded-lg bg-white/80 p-3">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-blue-800 underline decoration-blue-300 underline-offset-2 hover:text-blue-950"
                      >
                        {item.headlineKo}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-blue-800">{item.headlineKo}</p>
                    )}
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">
                      {item.summaryKo}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-400">
                      {item.source}
                      {item.publishedAt && <span className="ml-1.5">· {item.publishedAt}</span>}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : card.newsRationaleKo ? (
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <h2 className="font-semibold text-blue-950">뉴스 기반 판단 근거</h2>
              <p className="mt-2 text-sm leading-relaxed text-blue-950">
                {card.newsRationaleKo}
              </p>
            </div>
          ) : null}

          <RecommendationActions
            recId={card.id}
            ticker={card.ticker}
            riskMode={card.confidenceScore}
            page="detail"
            reasonLine={card.reasonLine}
          />
        </section>

        {/* Price chart section */}
        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">가격 추이 (최근 1개월)</h2>
            {regularMarketPrice != null && (
              <span className="text-xs text-slate-400">
                현재 ${regularMarketPrice.toFixed(2)}
                {regularMarketTime != null && (
                  <span className="ml-1">
                    ({new Date(regularMarketTime * 1000).toLocaleTimeString("en-US", {
                      timeZone: "America/New_York",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })} ET 기준)
                  </span>
                )}
              </span>
            )}
          </div>
          <PriceChart ohlcv={ohlcv} direction={card.direction} height={200} />
          {ohlcv.length === 0 && (
            <p className="mt-2 text-xs text-slate-400">가격 데이터를 불러올 수 없습니다.</p>
          )}
        </section>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold">근거 스냅샷</h2>
          {evidence ? (
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-slate-500">뉴스 신호</dt>
                <dd className="font-semibold">{evidence.newsSignalScore ?? "N/A"}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-slate-500">거래량 신호</dt>
                <dd className="font-semibold">{evidence.volumeSignalScore ?? "N/A"}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-slate-500">커뮤니티 신호</dt>
                <dd className="font-semibold">{evidence.communitySignalScore ?? "N/A"}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-slate-500">패턴 태그</dt>
                <dd className="font-semibold">{evidence.patternTag ?? "N/A"}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-slate-600">근거 데이터 축적 중입니다.</p>
          )}
        </section>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold">성과 카드 (실패 포함 기록)</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-500">성공률</dt>
              <dd className="font-semibold">{successRate == null ? "데이터 축적 중" : `${successRate}%`}</dd>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <dt className="text-slate-500">평균 수익률</dt>
              <dd className="font-semibold text-emerald-700">
                {avgReturn == null ? "데이터 축적 중" : `${avgReturn.toFixed(1)}%`}
              </dd>
            </div>
            <div className="rounded-lg bg-rose-50 p-3">
              <dt className="text-slate-500">실패</dt>
              <dd className="font-semibold text-rose-700">{losses}건</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-500">평가 중</dt>
              <dd className="font-semibold">
                {performance.filter((record) => record.hitFlag == null).length}건
              </dd>
            </div>
          </dl>
        </section>

        {performance.length >= 3 && (
          <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold">유사 패턴 참고</h2>
            <p className="mt-2 text-sm text-slate-600">
              최근 {performance.length}건의 동일 종목 평가 기록을 함께 확인하세요.
            </p>
          </section>
        )}

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold">최근 성과 이력</h2>
          {performance.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">데이터 축적 중입니다.</p>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {performance.slice(0, 30).map((record) => (
                <div key={record.id} className="flex items-center justify-between py-3 text-sm">
                  <span>{record.predictedDirection}</span>
                  <span>{record.realizedReturn == null ? "평가 중" : `${record.realizedReturn}%`}</span>
                  <span>{outcomeLabel(record.hitFlag)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <Disclaimer />
      </div>
    </main>
  );
}
