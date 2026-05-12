import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { availableWatchlistItems } from '../mockData';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { StockAlarmBrand } from '../components/StockAlarmBrand';
import { Badge } from '../components/ui/badge';
import { ROUTES } from '../routes';

interface OnboardingPageV2Props {
  onNavigate: (route: string) => void;
}

export function OnboardingPageV2({ onNavigate }: OnboardingPageV2Props) {
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
    onNavigate(ROUTES.home);
  };

  return (
    <div className="min-h-screen bg-[#f7f8f5]">
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mb-4 flex justify-center">
            <StockAlarmBrand variant="mark-lg" />
          </div>
          <h1 className="text-3xl font-bold text-slate-950">
            관심 있는 종목을 선택하세요
          </h1>
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 shadow-sm">
            <span className="text-2xl font-bold text-slate-950">
              {selectedItems.length}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-600">3 선택됨</span>
          </div>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            선택한 종목 또는 섹터는 홈 추천 카드와 이력 필터 기준으로 사용됩니다
          </p>
        </div>

        {/* Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableWatchlistItems.map(({ ticker, name, kind }) => {
            const isSelected = selectedItems.includes(ticker);
            return (
              <button
                key={ticker}
                onClick={() => toggleSelection(ticker)}
                className={`relative overflow-hidden rounded-lg p-6 transition-all duration-300 ${
                  isSelected
                    ? ' shadow-sm'
                    : 'shadow-sm'
                }`}
              >
                {/* Background */}
                <div className={`absolute inset-0 transition-all ${
                  isSelected
                    ? 'bg-slate-950'
                    : 'border border-slate-200 bg-white'
                }`} />

                {/* Check Mark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm animate-in zoom-in duration-200">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                )}

                {/* Content */}
                <div className="relative space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {ticker}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${isSelected ? 'border-white/30 bg-white/10 text-white' : ''}`}
                    >
                      {kind === 'ticker' ? '종목' : '섹터'}
                    </Badge>
                  </div>
                  <div className={`text-sm ${isSelected ? 'text-blue-100' : 'text-slate-600'}`}>
                    {name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Complete Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleComplete}
            disabled={selectedItems.length === 0}
            className="w-full md:w-auto min-w-80 h-14 rounded-lg bg-blue-600 text-white shadow-sm transition-all hover:bg-blue-700 disabled:bg-slate-300"
          >
            선택 완료하고 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
