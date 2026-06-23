import { Copy, ArrowRight, ExternalLink, TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';
import type { RecommendationCard as RecommendationCardType } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useRecommendationActions } from '../hooks/useRecommendationActions';

interface RecommendationCardProps {
  rec: RecommendationCardType;
  onCardClick: (recId: string) => void;
}

export function RecommendationCard({ rec, onCardClick }: RecommendationCardProps) {
  const { handleCopyPrice, handleBrokerRedirect } = useRecommendationActions();

  return (
    <div
      className="group border border-slate-200 bg-white rounded-lg shadow-sm p-6 transition-all duration-300 cursor-pointer hover:border-slate-300"
      onClick={() => onCardClick(rec.id)}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center shadow-sm ${
            rec.direction === 'BUY'
              ? 'bg-emerald-600'
              : 'bg-rose-600'
          }`}>
            {rec.direction === 'BUY' ? (
              <TrendingUp className="w-7 h-7 text-white" />
            ) : (
              <TrendingDown className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">{rec.ticker}</h3>
              <Badge
                className={`${
                  rec.direction === 'BUY'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                } border`}
              >
                {rec.direction}
              </Badge>
            </div>
            <div className="text-sm text-slate-600">{rec.companyName}</div>
          </div>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1">
          <span className="text-xs font-medium text-blue-700">{rec.actionLabel}</span>
        </div>
      </div>

      {/* Price Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg border border-slate-200 bg-[#f7f8f5] p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-slate-600">진입가</span>
          </div>
          <div className="text-lg font-bold text-slate-900">
            {rec.entryPrice
              ? `$${rec.entryPrice.toFixed(2)}`
              : `$${rec.entryRangeMin}-${rec.entryRangeMax}`}
          </div>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs text-slate-600">목표가</span>
          </div>
          <div className="text-lg font-bold text-green-700">
            {rec.targetPrice
              ? `$${rec.targetPrice.toFixed(2)}`
              : `$${rec.targetRangeMin}-${rec.targetRangeMax}`}
          </div>
        </div>
        <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-xs text-slate-600">매도 기준가</span>
          </div>
          <div className="text-lg font-bold text-red-700">${rec.exitPrice.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-[#f7f8f5] p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-slate-600">권장 보유</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{rec.holdDays}일</div>
        </div>
      </div>

      {/* Reason */}
      <div className="rounded-lg border border-slate-200 bg-[#f7f8f5] p-4 mb-4">
        <p className="text-sm text-slate-700 leading-relaxed">{rec.reasonLine}</p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleCopyPrice(rec, 'home');
          }}
          variant="outline"
          size="sm"
          className="rounded-lg border-2 hover:bg-blue-50 hover:border-blue-300"
        >
          <Copy className="w-4 h-4 mr-1" />
          복사
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onCardClick(rec.id);
          }}
          size="sm"
          className="rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700"
        >
          상세
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleBrokerRedirect(rec.ticker, 'home');
          }}
          variant="outline"
          size="sm"
          className="rounded-lg border-2 hover:bg-indigo-50 hover:border-indigo-300"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          매매
        </Button>
      </div>
    </div>
  );
}
