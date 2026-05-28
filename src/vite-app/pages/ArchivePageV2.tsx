import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { performanceRecords, watchlistItemByTicker } from '../mockData';
import { NavigationV2 } from '../components/NavigationV2';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Filter, TrendingUp, TrendingDown, Award, Calendar } from 'lucide-react';
import { usePerformanceStats } from '../hooks/usePerformanceStats';
import { ROUTES } from '../routes';

interface ArchivePageV2Props {
  onNavigate: (route: string) => void;
}

export function ArchivePageV2({ onNavigate }: ArchivePageV2Props) {
  const { addDebugEvent, watchlist } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<string>('전체');

  useEffect(() => {
    addDebugEvent('archive_view');
  }, []);

  const filters = ['전체', ...watchlist];

  const filteredRecords =
    selectedFilter === '전체'
      ? performanceRecords
      : performanceRecords.filter(r => r.ticker === selectedFilter);

  const sortedRecords = [...filteredRecords].sort((a, b) =>
    new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime()
  );

  const { successRate } = usePerformanceStats(sortedRecords);

  return (
    <div className="min-h-screen bg-[#f7f8f5]">
      <NavigationV2 currentRoute={ROUTES.archive} onNavigate={onNavigate} />

      <div className="max-w-5xl mx-auto p-4 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-6 pt-4">
          <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-slate-950 rounded-lg flex items-center justify-center shadow-sm">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-950">
                  추천 이력
                </h1>
                <p className="text-sm text-slate-600">과거 추천 성과 기록</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#f7f8f5] rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-600 mb-1">총 기록</div>
                <div className="text-xl font-bold text-slate-900">{sortedRecords.length}</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <div className="text-xs text-slate-600 mb-1">성공률</div>
                <div className="text-xl font-bold text-green-700">{successRate}%</div>
              </div>
              <div className="bg-[#f7f8f5] rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-600 mb-1">필터</div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedFilter === '전체'
                    ? selectedFilter
                    : watchlistItemByTicker[selectedFilter]?.name ?? selectedFilter}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-slate-700" />
              <span className="text-sm font-medium text-slate-900">종목 필터</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => {
                    setSelectedFilter(filter);
                    addDebugEvent('archive_filter_change', { filter });
                  }}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                    selectedFilter === filter
                      ? 'bg-slate-950 text-white shadow-sm '
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 '
                  }`}
                >
                  {filter === '전체' ? filter : watchlistItemByTicker[filter]?.name ?? filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Records */}
        {sortedRecords.length === 0 ? (
          <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-12 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
              <Award className="w-10 h-10 text-slate-600" />
            </div>
            <div className="space-y-2">
              <p className="text-slate-700 font-medium">
                {selectedFilter === '전체'
                  ? '아직 쌓인 추천 이력이 없습니다'
                  : '선택한 항목의 이력이 아직 없습니다'}
              </p>
              <p className="text-sm text-slate-500">
                추천 카드가 평가되면 성공과 실패 기록이 여기에 표시됩니다.
              </p>
            </div>
            <Button
              onClick={() => onNavigate(ROUTES.settings)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
            >
              관심 종목 수정하기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRecords.map((record, index) => (
              <div
                key={index}
                className="border border-slate-200 bg-white rounded-lg shadow-sm hover:shadow-sm transition-all p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${
                      record.predictedDirection === 'BUY'
                        ? 'bg-emerald-600'
                        : 'bg-rose-600'
                    }`}>
                      {record.predictedDirection === 'BUY' ? (
                        <TrendingUp className="w-6 h-6 text-white" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-white" />
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{record.ticker}</span>
                        <Badge
                          className={`${
                            record.predictedDirection === 'BUY'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-red-100 text-red-700 border-red-200'
                          } border text-xs`}
                        >
                          {record.predictedDirection}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className={`font-bold ${
                          record.hitFlag === 'success'
                            ? 'text-green-600'
                            : record.hitFlag === 'fail'
                            ? 'text-red-600'
                            : 'text-slate-600'
                        }`}>
                          {record.realizedReturn}
                        </span>
                        <Badge
                          className={`${
                            record.hitFlag === 'success'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : record.hitFlag === 'fail'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          } border text-xs`}
                        >
                          {record.hitFlag === 'success' ? '성공' : record.hitFlag === 'fail' ? '실패' : '평가 중'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {record.evaluatedAt}
                    </div>
                    <div className="text-xs text-slate-400">{record.evaluationWindowDays}일</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
