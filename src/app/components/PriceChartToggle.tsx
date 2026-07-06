"use client";

import { useState } from "react";
import { PriceChart, type PricePoint, type ForecastOverlay } from "./PriceChart";

interface PriceChartToggleProps {
  ticker: string;
  direction: "BUY" | "SELL";
  forecast?: ForecastOverlay | null;
}

type State =
  | { kind: "closed" }
  | { kind: "loading" }
  | { kind: "open"; ohlcv: PricePoint[]; marketPrice: number; marketTime: number | null }
  | { kind: "error"; message: string };

interface PriceApiResponse {
  ticker: string;
  regularMarketPrice: number;
  regularMarketTime?: number | null;
  ohlcv: PricePoint[];
  error?: string;
}

function fmtEasternTime(unixSec: number): string {
  return new Date(unixSec * 1000).toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <polyline points="2,14 7,9 11,12 18,5" />
      <line x1="2" y1="17" x2="18" y2="17" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <polyline points="5,8 10,13 15,8" />
    </svg>
  );
}

export function PriceChartToggle({ ticker, direction, forecast }: PriceChartToggleProps) {
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
        marketTime: data.regularMarketTime ?? null,
      });
    } catch {
      setState({ kind: "error", message: "네트워크 오류가 발생했습니다." });
    }
  }

  const isOpen = state.kind === "open";
  const isLoading = state.kind === "loading";

  return (
    <div className="mt-4">
      {/* Toggle button — generous tap target */}
      <button
        type="button"
        onClick={() => void handleOpen()}
        disabled={isLoading}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors ${
          isOpen
            ? "border-slate-300 bg-slate-100"
            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
        } disabled:cursor-not-allowed`}
      >
        <div className="flex items-center gap-3">
          {isLoading ? (
            <span className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          ) : (
            <ChartIcon className="h-4 w-4 shrink-0 text-slate-400" />
          )}
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {isLoading ? "차트 불러오는 중…" : "가격 차트"}
            </p>
            <p className="text-xs text-slate-400">최근 1개월</p>
          </div>
        </div>

        {!isLoading && <ChevronIcon open={isOpen} />}
      </button>

      {/* Error state */}
      {state.kind === "error" && (
        <p className="mt-2 px-1 text-xs text-rose-500">{state.message}</p>
      )}

      {/* Chart */}
      {state.kind === "open" && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-xs font-medium text-slate-500">최근 1개월</span>
            <span className="text-sm font-semibold text-slate-800">
              ${state.marketPrice.toFixed(2)}
              {state.marketTime != null && (
                <span className="ml-1.5 text-xs font-normal text-slate-400">
                  {fmtEasternTime(state.marketTime)} ET 기준
                </span>
              )}
            </span>
          </div>
          <PriceChart ohlcv={state.ohlcv} direction={direction} height={180} forecast={forecast} />
        </div>
      )}
    </div>
  );
}
