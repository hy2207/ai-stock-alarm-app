"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveWatchlist } from "@/lib/actions/saveWatchlist";
import { watchlistOptions } from "@/lib/constants/watchlistOptions";
import {
  buildWatchlistInput,
  getOnboardingSelectionState,
  toggleOnboardingSelection,
  validateOnboardingSelection,
} from "@/app/lib/onboardingSelection";
import { Button } from "@/app/components/ui/button";

interface WatchlistPickerFormProps {
  initialSelected?: string[];
  submitLabel: string;
  successMessage: string;
  redirectTo?: string;
}

export function WatchlistPickerForm({
  initialSelected = [],
  submitLabel,
  successMessage,
  redirectTo = "/today",
}: WatchlistPickerFormProps) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>(initialSelected);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectionState = getOnboardingSelectionState(selectedItems);

  const toggleSelection = (ticker: string) => {
    const nextSelectedItems = toggleOnboardingSelection(selectedItems, ticker);

    if (nextSelectedItems === selectedItems) {
      toast.error("최대 3개까지 선택 가능합니다.");
      return;
    }

    setSelectedItems(nextSelectedItems);
  };

  const handleSubmit = async () => {
    const validation = validateOnboardingSelection(selectedItems);
    if (!validation.ok) {
      toast.error("최소 1개 이상 선택해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildWatchlistInput(
        selectedItems,
        watchlistOptions.map((item) => ({
          ticker: item.ticker,
          kind: item.kind,
        })),
      );
      const result = await saveWatchlist(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(successMessage);
      router.push(redirectTo);
    } catch {
      toast.error("관심 종목 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          관심 있는 종목을 3개까지 선택하세요
        </h1>
        <p className="text-sm text-slate-600">
          {selectionState.count}/{selectionState.max} 선택됨
        </p>
        <p className="text-sm text-slate-600">
          선택한 종목은 아침 추천 카드 생성에 사용됩니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {watchlistOptions.map(({ ticker, name }) => {
          const isSelected = selectedItems.includes(ticker);
          return (
            <button
              key={ticker}
              type="button"
              onClick={() => toggleSelection(ticker)}
              disabled={isSubmitting}
              className={`rounded-lg border-2 p-4 transition-all ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="text-sm font-medium text-slate-900">{ticker}</div>
              <div className="text-xs text-slate-600">{name}</div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center pt-2">
        <Button
          onClick={() => void handleSubmit()}
          disabled={!selectionState.canSubmit || isSubmitting}
          className="min-w-64 w-full bg-blue-600 hover:bg-blue-700 md:w-auto"
        >
          {isSubmitting ? "저장 중..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
