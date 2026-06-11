import { useEffect, useState } from 'react';
import { ArrowLeft, Copy, Bell, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { recommendationsByRisk, performanceRecords } from '../mockData';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import type { RiskProfile } from '../types';
import { toast } from 'sonner';

interface RecommendationDetailPageProps {
  recId: string;
  onNavigate: (route: string) => void;
}

export function RecommendationDetailPage({ recId, onNavigate }: RecommendationDetailPageProps) {
  const { riskProfile, setRiskProfile, addDebugEvent } = useApp();
  const [selectedRisk, setSelectedRisk] = useState<RiskProfile>(riskProfile);

  useEffect(() => {
    addDebugEvent('rec_detail_view', { recId });
  }, [recId]);

  const allRecommendations = [
    ...recommendationsByRisk.conservative,
    ...recommendationsByRisk.balanced,
    ...recommendationsByRisk.aggressive,
  ];
  const recommendation = allRecommendations.find(r => r.id === recId);

  if (!recommendation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-slate-600">추천을 찾을 수 없습니다.</p>
          <Button onClick={() => onNavigate('/')}>홈으로 이동</Button>
        </div>
      </div>
    );
  }

  const currentRec = recommendationsByRisk[selectedRisk].find(
    r => r.ticker === recommendation.ticker
  );

  const rec = currentRec || recommendation;

  const tickerRecords = performanceRecords.filter(r => r.ticker === rec.ticker);
  const successCount = tickerRecords.filter(r => r.hitFlag === 'success').length;
  const successRate = tickerRecords.length > 0
    ? ((successCount / tickerRecords.length) * 100).toFixed(1)
    : '0.0';

  const avgReturn = tickerRecords.length > 0
    ? (
        tickerRecords.reduce((sum, r) => {
          const val = parseFloat(r.realizedReturn.replace(/[+%]/g, ''));
          return sum + val;
        }, 0) / tickerRecords.length
      ).toFixed(1)
    : '0.0';
  const avgReturnValue = Number(avgReturn);

  const handleRiskChange = (risk: RiskProfile) => {
    setSelectedRisk(risk);
    setRiskProfile(risk);
    addDebugEvent('confidence_change', { from: riskProfile, to: risk, page: 'detail' });
  };

  const handleCopyPrice = () => {
    const priceText = rec.entryPrice
      ? `$${rec.entryPrice}`
      : `$${rec.entryRangeMin} - $${rec.entryRangeMax}`;
    navigator.clipboard.writeText(priceText);
    toast.success('가격이 복사되었습니다.');
    addDebugEvent('price_copy', { ticker: rec.ticker, page: 'detail' });
  };

  const riskOptions: { value: RiskProfile; label: string }[] = [
    { value: 'conservative', label: '안정형' },
    { value: 'balanced', label: '중립형' },
    { value: 'aggressive', label: '공격형' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-4 pb-8 space-y-6">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">뒤로가기</span>
        </button>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-slate-900">{rec.ticker}</h1>
            <Badge
              variant={rec.direction === 'BUY' ? 'default' : 'destructive'}
              className={
                rec.direction === 'BUY'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {rec.direction}
            </Badge>
          </div>
          <div className="text-sm text-slate-600">{rec.companyName}</div>
          <div className="text-sm text-slate-700">{rec.actionLabel}</div>
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

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-slate-900">가격 요약</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">진입가</span>
              <span className="text-slate-900">
                {rec.entryPrice
                  ? `$${rec.entryPrice.toFixed(2)}`
                  : `$${rec.entryRangeMin} - $${rec.entryRangeMax}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">목표가</span>
              <span className="text-green-600">
                {rec.targetPrice
                  ? `$${rec.targetPrice.toFixed(2)}`
                  : `$${rec.targetRangeMin} - $${rec.targetRangeMax}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">손절가</span>
              <span className="text-red-600">${rec.stopPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">권장 보유</span>
              <span className="text-slate-900">{rec.holdDays}일</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-slate-900">한 줄 이유</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{rec.reasonLine}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-slate-900">근거 스냅샷</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="text-slate-600">뉴스 신호</div>
              <div className="text-slate-900">긍정적</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-600">거래량 신호</div>
              <div className="text-slate-900">평균 이상</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-600">커뮤니티 신호</div>
              <div className="text-slate-900">중립</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-600">패턴 태그</div>
              <div className="text-slate-900">단기 반등</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-slate-900">성과 카드 (실패 포함 기록)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-slate-600">성공률</div>
              <div className="text-slate-900">{successRate}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-600">평균 수익률</div>
              <div className="text-green-600">{avgReturnValue > 0 ? '+' : ''}{avgReturn}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-600">실패 건수</div>
              <div className="text-red-600">{tickerRecords.filter(r => r.hitFlag === 'fail').length}건</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-600">평가 중</div>
              <div className="text-slate-600">{tickerRecords.filter(r => r.hitFlag === 'evaluating').length}건</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-slate-900">최근 성과 이력</h2>
          <div className="space-y-2">
            {tickerRecords.slice(0, 5).map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={record.predictedDirection === 'BUY' ? 'default' : 'destructive'}
                    className={
                      record.predictedDirection === 'BUY'
                        ? 'bg-green-600'
                        : 'bg-red-600'
                    }
                  >
                    {record.predictedDirection}
                  </Badge>
                  <span
                    className={`text-sm ${
                      record.hitFlag === 'success'
                        ? 'text-green-600'
                        : record.hitFlag === 'fail'
                        ? 'text-red-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {record.realizedReturn}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {record.hitFlag === 'success' ? '성공' : record.hitFlag === 'fail' ? '실패' : '평가 중'}
                  </Badge>
                </div>
                <span className="text-xs text-slate-500">{record.evaluatedAt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCopyPrice} variant="outline" className="flex-1">
            <Copy className="w-4 h-4 mr-1" />
            가격 복사
          </Button>
          <Button
            onClick={() => {
              toast.success('알림이 설정되었습니다.');
              addDebugEvent('alert_set', { ticker: rec.ticker });
            }}
            variant="outline"
            className="flex-1"
          >
            <Bell className="w-4 h-4 mr-1" />
            알림 설정
          </Button>
        </div>

        <Button
          onClick={() => {
            if (confirm('외부 브로커 화면으로 이동합니다.')) {
              toast.success('브로커로 이동합니다.');
              addDebugEvent('broker_redirect', { ticker: rec.ticker, page: 'detail' });
            }
          }}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          브로커로 이동
        </Button>

        <div className="text-center text-xs text-slate-500 pt-4 space-y-1">
          <p>투자 참고용 정보이며 투자 자문이 아닙니다.</p>
          <p>실제 투자 결정과 책임은 사용자에게 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
