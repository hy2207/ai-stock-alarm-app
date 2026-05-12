import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { recommendationsByRisk, watchlistItemByTicker } from '../mockData';
import { NavigationV2 } from '../components/NavigationV2';
import type { RiskProfile } from '../types';
import { RecommendationCard } from '../components/RecommendationCard';
import { ROUTES } from '../routes';
import { Shield } from 'lucide-react';
import { StockAlarmBrand } from '../components/StockAlarmBrand';
import { Button } from '../components/ui/button';

interface HomePageV2Props {
  onNavigate: (route: string) => void;
}

/**
 * @page HomePageV2
 * @description
 * [Developer] The main dashboard page for the application. Displays the user's
 * personalized daily stock recommendations based on their watchlist and risk profile.
 * 
 * [AI Agent] When modifying the home dashboard layout or data sources, ensure that
 * the `RecommendationCard` component is used for displaying individual items to maintain UI consistency.
 */
export function HomePageV2({ onNavigate }: HomePageV2Props) {
  const { riskProfile, setRiskProfile, addDebugEvent, watchlist } = useApp();
  const [selectedRisk, setSelectedRisk] = useState<RiskProfile>(riskProfile);

  useEffect(() => {
    addDebugEvent('home_view');
  }, []);

  useEffect(() => {
    setSelectedRisk(riskProfile);
  }, [riskProfile]);

  const recommendations = recommendationsByRisk[selectedRisk].filter(rec =>
    watchlist.includes(rec.ticker)
  ).slice(0, 3);

  const handleRiskChange = (risk: RiskProfile) => {
    setSelectedRisk(risk);
    setRiskProfile(risk);
    addDebugEvent('confidence_change', { from: riskProfile, to: risk });
  };



  const handleCardClick = (recId: string) => {
    addDebugEvent('rec_card_click', { recId });
    onNavigate(`/recommendations/${recId}`);
  };

  const riskOptions: { value: RiskProfile; label: string; color: string }[] = [
    { value: 'conservative', label: '안정형', color: 'bg-emerald-600' },
    { value: 'balanced', label: '중립형', color: 'bg-blue-600' },
    { value: 'aggressive', label: '공격형', color: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8f5]">
      <NavigationV2 currentRoute={ROUTES.home} onNavigate={onNavigate} />

      <div className="max-w-5xl mx-auto p-4 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-8 pt-4">
          <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <StockAlarmBrand variant="mark" />
              <div>
                <h1 className="text-2xl font-semibold text-slate-950">
                  오늘의 의사결정 카드
                </h1>
                <p className="text-sm text-slate-500">
                  {new Date().toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600">관심 항목 기준 {recommendations.length}개 추천</p>
            <p className="text-xs text-slate-500 mt-2">
              현재 기준: {watchlist.map(item => watchlistItemByTicker[item]?.name ?? item).join(', ')}
            </p>
          </div>
        </div>

        {/* Risk Profile Selector */}
        <div className="mb-6">
          <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-slate-900">Confidence Score</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {riskOptions.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => handleRiskChange(value)}
                  className={`relative overflow-hidden rounded-lg border p-4 transition-all ${
                    selectedRisk === value
                      ? 'border-slate-950 bg-slate-950 shadow-sm'
                      : 'border-slate-200 bg-[#f7f8f5] hover:bg-white'
                  }`}
                >
                  <div className="relative">
                    <div className={`text-sm font-medium flex items-center justify-center gap-2 ${
                      selectedRisk === value ? 'text-white' : 'text-slate-900'
                    }`}>
                      <span className={`size-2 rounded-full ${color}`} />
                      {label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendation Cards */}
        {recommendations.length === 0 ? (
          <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-8 text-center space-y-4">
            <h2 className="text-lg font-bold text-slate-900">아직 보여줄 추천이 없습니다</h2>
            <p className="text-sm text-slate-600">
              선택한 종목 또는 섹터에 맞는 목업 추천이 준비되지 않았습니다.
            </p>
            <p className="text-sm text-slate-500">
              관심 항목을 조정하면 홈 카드와 이력 필터가 함께 갱신됩니다.
            </p>
            <Button
              onClick={() => onNavigate(ROUTES.settings)}
              variant="outline"
              className="rounded-lg border-2"
            >
              관심 항목 조정하기
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <RecommendationCard 
                key={rec.id} 
                rec={rec} 
                onCardClick={handleCardClick} 
              />
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center text-xs text-slate-500 mt-8 border border-slate-200 bg-white rounded-lg p-4 space-y-1">
          <p>투자 참고용 정보이며 투자 자문이 아닙니다.</p>
          <p>실제 투자 결정과 책임은 사용자에게 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
