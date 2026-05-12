import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { availableWatchlistItems } from '../mockData';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

interface OnboardingPageProps {
  onNavigate: (route: string) => void;
}

export function OnboardingPage({ onNavigate }: OnboardingPageProps) {
  const { setWatchlist, addDebugEvent } = useApp();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleSelection = (ticker: string) => {
    if (selectedItems.includes(ticker)) {
      setSelectedItems(selectedItems.filter(t => t !== ticker));
      addDebugEvent('watchlist_item_deselected', { ticker });
    } else {
      if (selectedItems.length >= 3) {
        toast.error('최대 3개까지 선택 가능합니다.');
        addDebugEvent('watchlist_max_reached');
        return;
      }
      setSelectedItems([...selectedItems, ticker]);
      addDebugEvent('watchlist_item_selected', { ticker });
    }
  };

  const handleComplete = () => {
    if (selectedItems.length === 0) return;

    setWatchlist(selectedItems);
    addDebugEvent('onboarding_complete', { watchlist: selectedItems });
    onNavigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-slate-900">관심 있는 종목을 3개까지 선택하세요</h1>
          <div className="text-sm text-slate-600">
            {selectedItems.length}/3 선택됨
          </div>
          <p className="text-sm text-slate-600">
            선택한 종목은 아침 추천 카드 생성에 사용됩니다.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableWatchlistItems.map(({ ticker, name }) => {
            const isSelected = selectedItems.includes(ticker);
            return (
              <button
                key={ticker}
                onClick={() => toggleSelection(ticker)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-sm text-slate-900">{ticker}</div>
                <div className="text-xs text-slate-600">{name}</div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleComplete}
            disabled={selectedItems.length === 0}
            className="w-full md:w-auto min-w-64 bg-blue-600 hover:bg-blue-700"
          >
            선택 완료
          </Button>
        </div>
      </div>
    </div>
  );
}
