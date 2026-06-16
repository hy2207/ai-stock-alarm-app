import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { performanceRecords } from '../mockData';
import { Navigation } from '../components/Navigation';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

interface ArchivePageProps {
  onNavigate: (route: string) => void;
}

export function ArchivePage({ onNavigate }: ArchivePageProps) {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="hidden md:block">
        <Navigation currentRoute="/archive" onNavigate={onNavigate} />
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-20 md:pb-8 space-y-6">
        <h1 className="text-slate-900">추천 이력</h1>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => {
                setSelectedFilter(filter);
                addDebugEvent('archive_filter_change', { filter });
              }}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                selectedFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center space-y-4">
            <p className="text-slate-600">아직 쌓인 추천 이력이 없습니다.</p>
            <p className="text-sm text-slate-500">
              추천 카드가 평가되면 성공과 실패 기록이 여기에 표시됩니다.
            </p>
            <Button onClick={() => onNavigate('/settings')} variant="outline">
              관심 종목 수정하기
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            {filteredRecords.map((record, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-900 w-16">{record.ticker}</div>
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
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      record.hitFlag === 'success'
                        ? 'text-green-600 border-green-600'
                        : record.hitFlag === 'fail'
                        ? 'text-red-600 border-red-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {record.hitFlag === 'success'
                      ? '성공'
                      : record.hitFlag === 'fail'
                      ? '실패'
                      : '평가 중'}
                  </Badge>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-slate-500">{record.evaluatedAt}</span>
                  <span className="text-xs text-slate-400">{record.evaluationWindowDays}일</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="md:hidden">
        <Navigation currentRoute="/archive" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
