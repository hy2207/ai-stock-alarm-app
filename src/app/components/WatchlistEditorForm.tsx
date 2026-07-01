"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveWatchlist } from "@/lib/actions/saveWatchlist";
import { watchlistOptions } from "@/lib/constants/watchlistOptions";
import { TickerSearchInput } from "./TickerSearchInput";
import { Button } from "./ui/button";
import type { Top50Ticker } from "./Top50Grid";

const MAX = 3;

interface SelectedTicker {
  ticker: string;
  name: string;
}

interface WatchlistEditorFormProps {
  initialSelected: SelectedTicker[];
  top50: Top50Ticker[];
}

export function WatchlistEditorForm({ initialSelected, top50 }: WatchlistEditorFormProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<SelectedTicker[]>(initialSelected);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTickers = selected.map((s) => s.ticker);
  const maxReached = selected.length >= MAX;

  function addTicker(ticker: string, name: string) {
    if (maxReached) { toast.error("최대 3개까지 선택 가능합니다."); return; }
    if (selectedTickers.includes(ticker)) return;
    setSelected((prev) => [...prev, { ticker, name }]);
  }

  function removeTicker(ticker: string) {
    setSelected((prev) => prev.filter((s) => s.ticker !== ticker));
  }

  function toggleTop50(row: Top50Ticker) {
    if (selectedTickers.includes(row.ticker)) {
      removeTicker(row.ticker);
    } else {
      addTicker(row.ticker, row.name);
    }
  }

  async function handleSave() {
    if (selected.length === 0) { toast.error("최소 1개 이상 선택해 주세요."); return; }

    setIsSubmitting(true);
    try {
      const allOptions = [
        ...watchlistOptions.map((o) => ({ ticker: o.ticker, kind: o.kind as "ticker" | "sector" })),
        ...top50.map((o) => ({ ticker: o.ticker, kind: "ticker" as const })),
      ];

      const payload = {
        items: selected.map((s) => {
          const opt = allOptions.find((o) => o.ticker === s.ticker);
          return { ticker: s.ticker, kind: opt?.kind ?? ("ticker" as const) };
        }),
      };

      const result = await saveWatchlist(payload);
      if (!result.success) { toast.error(result.error); return; }

      toast.success("관심 종목이 업데이트되었습니다.");
      router.push("/settings");
    } catch {
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Group top-50 by sector for display
  const sectors = Array.from(new Set(top50.map((t) => t.sector ?? "기타")));

  return (
    <div className="space-y-6">
      {/* Selected chips */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">
          선택된 종목 ({selected.length}/{MAX})
        </p>
        {selected.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 py-4 text-center text-sm text-slate-400">
            아래에서 종목을 선택하거나 검색하세요
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((s) => (
              <span
                key={s.ticker}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
              >
                {s.ticker}
                <button
                  type="button"
                  onClick={() => removeTicker(s.ticker)}
                  aria-label={`${s.ticker} 제거`}
                  className="rounded-full hover:bg-blue-700 p-0.5 leading-none"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">검색으로 추가</p>
        <TickerSearchInput
          selectedTickers={selectedTickers}
          onAdd={addTicker}
          maxReached={maxReached}
        />
      </div>

      {/* Top 50 by sector */}
      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">시총 50위 기업</p>
        <div className="space-y-4">
          {sectors.map((sector) => {
            const tickers = top50.filter((t) => (t.sector ?? "기타") === sector);
            return (
              <div key={sector}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {sector}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {tickers.map((row) => {
                    const isSelected = selectedTickers.includes(row.ticker);
                    return (
                      <button
                        key={row.ticker}
                        type="button"
                        onClick={() => toggleTop50(row)}
                        disabled={!isSelected && maxReached}
                        className={`rounded-lg border-2 p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                          isSelected
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-900">{row.ticker}</span>
                          {row.marketCapRank <= 10 && (
                            <span className="text-[10px] text-blue-500">TOP{row.marketCapRank}</span>
                          )}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-slate-500">{row.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end border-t border-slate-100 pt-4">
        <Button
          onClick={() => void handleSave()}
          disabled={selected.length === 0 || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "저장 중…" : "변경사항 저장"}
        </Button>
      </div>
    </div>
  );
}
