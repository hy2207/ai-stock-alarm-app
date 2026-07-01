"use client";

import { useState } from "react";
import { captureClientEvent } from "@/lib/analytics/posthog";
import {
  captureBookmarkAdd,
  captureReasonExpand,
  type RecommendationActionInput,
  type RecommendationActionPage,
} from "./recommendationActionEvents";

interface RecommendationActionsProps {
  recId: string;
  ticker: string;
  riskMode: string;
  page: RecommendationActionPage;
  reasonLine?: string;
}

function baseAction(input: RecommendationActionsProps): RecommendationActionInput {
  return {
    recId: input.recId,
    ticker: input.ticker,
    riskMode: input.riskMode,
    page: input.page,
  };
}

const buttonClass =
  "rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700";

export function RecommendationActions(props: RecommendationActionsProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [reasonExpanded, setReasonExpanded] = useState(false);
  const action = baseAction(props);

  async function handleBookmarkAdd() {
    await captureBookmarkAdd(action, captureClientEvent);
    setStatus("관심 저장 의향을 기록했습니다.");
  }

  async function handleReasonToggle() {
    const expanded = !reasonExpanded;
    setReasonExpanded(expanded);
    await captureReasonExpand(action, captureClientEvent, expanded);
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonClass} onClick={handleBookmarkAdd}>
          관심 저장
        </button>
        {props.reasonLine && (
          <button type="button" className={buttonClass} onClick={handleReasonToggle}>
            {reasonExpanded ? "이유 접기" : "이유 더보기"}
          </button>
        )}
      </div>

      {reasonExpanded && props.reasonLine && (
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
          {props.reasonLine}
        </p>
      )}

      {status && <p className="text-xs text-slate-500">{status}</p>}
    </div>
  );
}
