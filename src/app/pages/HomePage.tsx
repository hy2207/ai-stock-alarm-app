import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { recommendationsByRisk } from '../mockData';
import { RecommendationCard } from '../components/RecommendationCard';
import type { RiskProfile } from '../types';
import { Navigation } from '../components/Navigation';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { riskProfile, setRiskProfile, addDebugEvent, watchlist } = useApp();
  const [selectedRisk, setSelectedRisk] = useState<RiskProfile>(riskProfile);

  useEffect(() => {
    addDebugEvent('home_view');
  }, []);

  const recommendations = recommendationsByRisk[selectedRisk].filter(rec =>
    watchlist.includes(rec.ticker)
  );

  const handleRiskChange = (risk: RiskProfile) => {
    setSelectedRisk(risk);
    setRiskProfile(risk);
    addDebugEvent('confidence_change', { from: riskProfile, to: risk });
  };

  const handleCardClick = (recId: string) => {
    addDebugEvent('rec_card_click', { recId });
    onNavigate(`/recommendations/${recId}`);
  };

  const riskOptions: { value: RiskProfile; label: string }[] = [
    { value: 'conservative', label: '안정형' },
    { value: 'balanced', label: '중립형' },
    { value: 'aggressive', label: '공격형' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="hidden md:block">
        <Navigation currentRoute="/" onNavigate={onNavigate} />
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-20 md:pb-8 space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-slate-600">
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </div>
          <h1 className="text-slate-900">오늘의 의사결정 카드</h1>
          <p className="text-sm text-slate-600">관심 종목 기준 3개 이하로 압축했습니다</p>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-slate-700">Confidence Score</div>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
            {riskOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleRiskChange(value)}
                className={`flex-1 py-2 px-4 rounded-md text-sm transition-all ${
                  selectedRisk === value
                    ? 'bg-white text-slate-900 shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {recommendations.map(rec => (
            <div
              key={rec.id}
              onClick={() => {
                addDebugEvent('rec_card_impression', { recId: rec.id });
              }}
            >
              <RecommendationCard
                rec={rec}
                onCardClick={handleCardClick}
              />
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-slate-500 pt-4 space-y-1">
          <p>투자 참고용 정보이며 투자 자문이 아닙니다.</p>
          <p>실제 투자 결정과 책임은 사용자에게 있습니다.</p>
        </div>
      </div>

      <div className="md:hidden">
        <Navigation currentRoute="/" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
