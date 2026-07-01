"use client";

import { useEffect, useRef, useState } from "react";
import type { TickerSearchResult } from "@/app/api/ticker-search/route";

interface TickerSearchInputProps {
  selectedTickers: string[];
  onAdd: (ticker: string, name: string) => void;
  maxReached: boolean;
}

export function TickerSearchInput({ selectedTickers, onAdd, maxReached }: TickerSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TickerSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/ticker-search?q=${encodeURIComponent(trimmed)}`);
        const data: TickerSearchResult[] = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSelect(result: TickerSearchResult) {
    if (maxReached) return;
    if (selectedTickers.includes(result.ticker)) return;
    onAdd(result.ticker, result.name);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={maxReached ? "최대 3개까지 선택 가능합니다" : "종목명 또는 티커 검색 (예: Apple, AAPL)"}
          disabled={maxReached}
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        />
        {isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            검색 중…
          </span>
        )}
      </div>

      {open && (
        <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.map((result) => {
            const alreadySelected = selectedTickers.includes(result.ticker);
            return (
              <li key={result.ticker}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  disabled={alreadySelected || maxReached}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>
                    <span className="font-semibold text-slate-900">{result.ticker}</span>
                    <span className="ml-2 text-slate-500">{result.name}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {result.sector && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                        {result.sector}
                      </span>
                    )}
                    {result.marketCapRank && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
                        시총 {result.marketCapRank}위
                      </span>
                    )}
                    {alreadySelected && (
                      <span className="text-xs text-emerald-600">선택됨</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
