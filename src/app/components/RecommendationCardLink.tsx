import type { RecommendationCardOutput } from "@/lib/dto/recommendationCard";
import { parseNewsItems, parseQuantForecast } from "@/lib/dto/recommendationCard";
import {
  forecastChangePct,
  describeDirection,
  shortChangeText,
} from "@/lib/quant/describeForecast";
import { PostHogEvent } from "./PostHogEvent";
import { RecommendationActions } from "./RecommendationActions";
import { PriceChartToggle } from "./PriceChartToggle";

const CONFIDENCE_LABELS = {
  conservative: "안정형",
  balanced: "중립형",
  aggressive: "공격형",
} as const;

function formatPriceTime(createdAt: Date | string): string {
  const d = new Date(createdAt);
  return (
    new Intl.DateTimeFormat("ko-KR", {
      timeZone: "America/New_York",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d) + " ET 기준"
  );
}

function formatPrice(
  card: RecommendationCardOutput,
  kind: "current" | "entry" | "target",
): string {
  if (kind === "current") {
    return card.currentPrice != null
      ? `$${card.currentPrice.toFixed(2)}`
      : formatPrice(card, "entry");
  }

  const price = kind === "entry" ? card.entryPrice : card.targetPrice;
  const low = kind === "entry" ? card.entryRangeLow : card.targetRangeLow;
  const high = kind === "entry" ? card.entryRangeHigh : card.targetRangeHigh;

  if (price != null) return `$${price.toFixed(2)}`;
  if (low != null && high != null) return `$${low.toFixed(2)}-$${high.toFixed(2)}`;
  return "가격 확인 필요";
}

export function RecommendationCardLink({ card }: { card: RecommendationCardOutput }) {
  const reasonText = card.reasonLine;
  const newsItems = parseNewsItems(card.newsItems);
  const quant = parseQuantForecast(card.quantForecast);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <PostHogEvent
        event="rec_card_impression"
        properties={{
          recId: card.id,
          ticker: card.ticker,
          riskMode: card.confidenceScore,
        }}
      />
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{card.ticker}</h2>
          <p className="text-sm text-slate-500">
            {CONFIDENCE_LABELS[card.confidenceScore]}
          </p>
        </div>
        <span
          className={
            card.direction === "BUY"
              ? "rounded-md bg-emerald-50 px-2 py-1 text-sm font-medium text-emerald-700"
              : "rounded-md bg-rose-50 px-2 py-1 text-sm font-medium text-rose-700"
          }
        >
          {card.direction}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-slate-500">현재가</dt>
          <dd className="font-semibold text-slate-950">{formatPrice(card, "current")}</dd>
          <dd className="mt-0.5 text-[10px] text-slate-400">{formatPriceTime(card.createdAt)}</dd>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3">
          <dt className="text-slate-500">목표가</dt>
          <dd className="font-semibold text-emerald-700">{formatPrice(card, "target")}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-slate-500">보유 기간</dt>
          <dd className="font-semibold text-slate-950">{card.holdDays}일</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-slate-500">매도 기준가</dt>
          <dd className="font-semibold text-slate-950">
            {card.exitPrice != null ? `$${card.exitPrice.toFixed(2)}` : "미지정"}
          </dd>
        </div>
      </dl>

      {quant && (card.currentPrice ?? card.entryPrice) != null && (() => {
        const changePct = forecastChangePct(
          quant.expectedPrice,
          (card.currentPrice ?? card.entryPrice)!,
        );
        const dir = describeDirection(changePct);
        const toneClass =
          dir.tone === "up"
            ? "text-emerald-700"
            : dir.tone === "down"
              ? "text-rose-600"
              : "text-slate-600";
        return (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2.5">
            <span className="text-xs font-medium text-indigo-900">
              수치 분석
              <span className="ml-1 font-normal text-indigo-400">
                · {quant.horizonDays}일 후
              </span>
            </span>
            <span className={`text-sm font-semibold ${toneClass}`}>
              {dir.arrow} {shortChangeText(changePct)}
            </span>
          </div>
        );
      })()}

      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        {reasonText}
      </p>

      {newsItems.length > 0 ? (
        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <h3 className="mb-2 text-xs font-semibold text-blue-800">
            뉴스 기반 판단 근거 ({newsItems.length}건)
          </h3>
          <ul className="space-y-2">
            {newsItems.map((item, i) => (
              <li key={i} className="rounded-md bg-white/70 p-2.5">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900"
                  >
                    {item.headlineKo}
                  </a>
                ) : (
                  <p className="text-xs font-medium text-blue-700">{item.headlineKo}</p>
                )}
                <p className="mt-0.5 text-xs text-slate-500">{item.summaryKo}</p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {item.source}
                  {item.publishedAt && <span className="ml-1.5">· {item.publishedAt}</span>}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : card.newsRationaleKo ? (
        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <h3 className="text-xs font-semibold text-blue-800">뉴스 기반 판단 근거</h3>
          <p className="mt-1 text-sm leading-relaxed text-blue-950">
            {card.newsRationaleKo}
          </p>
        </div>
      ) : null}

      <PriceChartToggle ticker={card.ticker} direction={card.direction} forecast={quant} />

      <RecommendationActions
        recId={card.id}
        ticker={card.ticker}
        riskMode={card.confidenceScore}
        page="home"
        detailHref={`/recommendations/${card.id}`}
      />
    </article>
  );
}
