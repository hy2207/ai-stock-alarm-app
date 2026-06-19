"use client";

import { useState } from "react";
import { captureClientEvent } from "@/lib/analytics/posthog";
import {
  captureAlertSet,
  captureBookmarkAdd,
  captureBrokerRedirect,
  capturePriceCopy,
  captureReasonExpand,
  formatEntryPriceText,
  type EntryPriceInput,
  type RecommendationActionInput,
  type RecommendationActionPage,
} from "./recommendationActionEvents";

interface RecommendationActionsProps extends EntryPriceInput {
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
  const entryPriceText = formatEntryPriceText(props);

  async function handleCopyPrice() {
    const clipboardAvailable = typeof navigator !== "undefined" && Boolean(navigator.clipboard);

    try {
      if (clipboardAvailable) {
        await navigator.clipboard.writeText(entryPriceText);
        setStatus("진입 가격을 복사했습니다.");
      } else {
        setStatus("클립보드를 사용할 수 없어 가격을 화면에서 확인해 주세요.");
      }
    } finally {
      await capturePriceCopy(action, captureClientEvent, clipboardAvailable);
    }
  }

  async function handleAlertSet() {
    await captureAlertSet(action, captureClientEvent);
    setStatus("알림 설정 의향을 기록했습니다. 실제 발송 증적은 OneSignal 검증에서 확인합니다.");
  }

  async function handleBookmarkAdd() {
    await captureBookmarkAdd(action, captureClientEvent);
    setStatus("관심 저장 의향을 기록했습니다.");
  }

  async function handleBrokerRedirect() {
    await captureBrokerRedirect(action, captureClientEvent);
    setStatus("외부 브로커 확인 의향을 기록했습니다. v1에서는 주문 실행을 연결하지 않습니다.");
  }

  async function handleReasonToggle() {
    const expanded = !reasonExpanded;
    setReasonExpanded(expanded);
    await captureReasonExpand(action, captureClientEvent, expanded);
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonClass} onClick={handleCopyPrice}>
          가격 복사
        </button>
        <button type="button" className={buttonClass} onClick={handleAlertSet}>
          알림 설정
        </button>
        <button type="button" className={buttonClass} onClick={handleBookmarkAdd}>
          관심 저장
        </button>
        <button type="button" className={buttonClass} onClick={handleBrokerRedirect}>
          증권사에서 확인
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
