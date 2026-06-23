import type { RecommendationCardOutput } from "@/lib/dto/recommendationCard";
import { PostHogEvent } from "./PostHogEvent";
import { RecommendationActions } from "./RecommendationActions";
import { TrackedLink } from "./TrackedLink";

const CONFIDENCE_LABELS = {
  conservative: "안정형",
  balanced: "중립형",
  aggressive: "공격형",
} as const;

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

      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        {reasonText}
      </p>

      {card.newsRationaleKo && (
        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <h3 className="text-xs font-semibold text-blue-800">뉴스 기반 판단 근거</h3>
          <p className="mt-1 text-sm leading-relaxed text-blue-950">
            {card.newsRationaleKo}
          </p>
        </div>
      )}

      <TrackedLink
        href={`/recommendations/${card.id}`}
        event="rec_card_click"
        eventProperties={{
          recId: card.id,
          ticker: card.ticker,
          riskMode: card.confidenceScore,
        }}
        className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
      >
        상세 보기
      </TrackedLink>

      <RecommendationActions
        recId={card.id}
        ticker={card.ticker}
        riskMode={card.confidenceScore}
        page="home"
        entryPrice={card.entryPrice}
        entryRangeLow={card.entryRangeLow}
        entryRangeHigh={card.entryRangeHigh}
      />
    </article>
  );
}
