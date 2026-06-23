"use client";

import { useMemo, useState, useTransition } from "react";
import { saveRiskProfile } from "@/lib/actions/saveRiskProfile";
import { captureClientEvent } from "@/lib/analytics/posthog";
import type { RecommendationCardOutput } from "@/lib/dto/recommendationCard";
import type { RiskMode } from "@/lib/dto/saveRiskProfile";
import { PostHogEvent } from "./PostHogEvent";
import { RecommendationCardLink } from "./RecommendationCardLink";

const RISK_OPTIONS: Array<{ value: RiskMode; label: string; description: string }> = [
  {
    value: "conservative",
    label: "안정형",
    description: "목표가는 유지하고, 매도 기준가를 앞당겨 이익을 먼저 지킵니다",
  },
  {
    value: "balanced",
    label: "중립형",
    description: "동일 목표가 안에서 진입과 매도 기준가를 균형 있게 잡습니다",
  },
  {
    value: "aggressive",
    label: "공격형",
    description: "뉴스 확신이 강하면 목표가 근처나 이후까지 매도를 늦춥니다",
  },
];

interface RiskModeRecommendationListProps {
  cards: RecommendationCardOutput[];
  initialRiskMode: RiskMode;
  watchlistTickers: string[];
}

export function RiskModeRecommendationList({
  cards,
  initialRiskMode,
  watchlistTickers,
}: RiskModeRecommendationListProps) {
  const [selectedRiskMode, setSelectedRiskMode] = useState(initialRiskMode);
  const [isPending, startTransition] = useTransition();

  const visibleCards = useMemo(() => {
    const cardsByTicker = new Map<string, RecommendationCardOutput[]>();
    for (const card of cards) {
      const tickerCards = cardsByTicker.get(card.ticker) ?? [];
      tickerCards.push(card);
      cardsByTicker.set(card.ticker, tickerCards);
    }

    return watchlistTickers.slice(0, 3).map((ticker) => {
      const tickerCards = cardsByTicker.get(ticker) ?? [];
      return {
        ticker,
        card: tickerCards.find((card) => card.confidenceScore === selectedRiskMode),
      };
    });
  }, [cards, selectedRiskMode, watchlistTickers]);

  const selectedOption = RISK_OPTIONS.find(
    (option) => option.value === selectedRiskMode,
  );

  function handleRiskModeChange(nextRiskMode: RiskMode) {
    const previousRiskMode = selectedRiskMode;
    setSelectedRiskMode(nextRiskMode);
    captureClientEvent("confidence_change", {
      from: previousRiskMode,
      to: nextRiskMode,
    });

    startTransition(async () => {
      const formData = new FormData();
      formData.set("riskMode", nextRiskMode);
      const result = await saveRiskProfile(formData);
      if (!result.success) {
        setSelectedRiskMode(previousRiskMode);
      }
    });
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">투자 성향</h2>
            <p className="mt-1 text-sm text-slate-600">
              {selectedOption?.description}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
            {RISK_OPTIONS.map((option) => {
              const selected = option.value === selectedRiskMode;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRiskModeChange(option.value)}
                  disabled={isPending && selected}
                  className={
                    selected
                      ? "rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-950 shadow-sm"
                      : "rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950"
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {visibleCards.map(({ ticker, card }) => (
          card ? (
            <RecommendationCardLink key={card.id} card={card} />
          ) : (
            <NoCallTickerCard
              key={ticker}
              ticker={ticker}
              riskMode={selectedRiskMode}
            />
          )
        ))}
      </div>
    </section>
  );
}

function NoCallTickerCard({
  ticker,
  riskMode,
}: {
  ticker: string;
  riskMode: RiskMode;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <PostHogEvent
        event="rec_card_impression"
        properties={{
          recId: `no-call-${ticker}-${riskMode}`,
          ticker,
          riskMode,
          state: "no_call",
        }}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{ticker}</h2>
          <p className="text-sm text-slate-500">선택 성향 카드 생성 대기</p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-medium text-slate-600">
          No Call
        </span>
      </div>
      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        오늘은 이 종목에 대해 충분히 명확한 뉴스 근거가 없어 BUY/SELL 판단을 보류했습니다.
      </p>
    </article>
  );
}
