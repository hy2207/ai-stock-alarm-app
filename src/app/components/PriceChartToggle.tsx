"use client";

import { useState } from "react";
import { PriceChart, type PricePoint } from "./PriceChart";

interface PriceChartToggleProps {
  ticker: string;
  direction: "BUY" | "SELL";
  entryPrice?: number | null;
  targetPrice?: number | null;
  exitPrice?: number | null;
}

type State =
  | { kind: "closed" }
  | { kind: "loading" }
  | { kind: "open"; ohlcv: PricePoint[]; marketPrice: number }
  | { kind: "error"; message: string };

interface PriceApiResponse {
  ticker: string;
  regularMarketPrice: number;
  ohlcv: PricePoint[];
  error?: string;
}

export function PriceChartToggle({
  ticker,
  direction,
  entryPrice,
  targetPrice,
  exitPrice,
}: PriceChartToggleProps) {
  const [state, setState] = useState<State>({ kind: "closed" });

  async function handleOpen() {
    if (state.kind === "open") {
      setState({ kind: "closed" });
      return;
    }
    if (state.kind === "loading") return;

    setState({ kind: "loading" });

    try {
      const res = await fetch(`/api/price/${encodeURIComponent(ticker)}`);
      const data: PriceApiResponse = await res.json();

      if (!res.ok || data.error) {
        setState({ kind: "error", message: data.error ?? "가격 데이터를 불러올 수 없습니다." });
        return;
      }

      setState({
        kind: "open",
        ohlcv: data.ohlcv,
        marketPrice: data.regularMarketPrice,
      });
    } catch {
      setState({ kind: "error", message: "네트워크 오류가 발생했습니다." });
    }
  }

  const isOpen = state.kind === "open";

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => void handleOpen()}
        className="flex w-full items-center justify-between text-xs font-medium text-slate-500 hover:text-slate-700"
      >
        <span>가격 추이 5일</span>
        <span
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {/* Expanded content */}
      {state.kind === "loading" && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border border-slate-300 border-t-slate-600" />
          차트 로딩 중…
        </div>
      )}

      {state.kind === "error" && (
        <p className="mt-2 text-xs text-slate-400">{state.message}</p>
      )}

      {state.kind === "open" && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
            <span>최근 5거래일</span>
            <span className="font-medium text-slate-600">
              현재 ${state.marketPrice.toFixed(2)}
            </span>
          </div>
          <PriceChart
            ohlcv={state.ohlcv}
            direction={direction}
            entryPrice={entryPrice}
            targetPrice={targetPrice}
            exitPrice={exitPrice}
            height={160}
          />
        </div>
      )}
    </div>
  );
}
