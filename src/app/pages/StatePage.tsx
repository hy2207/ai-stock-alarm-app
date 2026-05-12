import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { AlertCircle, FileX, ServerCrash } from 'lucide-react';

interface StatePageProps {
  type: 'no-call' | 'loading' | 'empty' | 'error';
  onNavigate: (route: string) => void;
}

export function StatePage({ type, onNavigate }: StatePageProps) {
  if (type === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-12 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'no-call') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-slate-900">오늘은 명확한 추천을 만들지 않았습니다</h2>
            <p className="text-sm text-slate-600">
              가격 데이터와 뉴스 신호가 충분히 정렬되지 않아 무리한 판단을 피했습니다.
            </p>
            <p className="text-sm text-slate-600">
              관심 종목을 조정하거나 내일 아침 브리핑을 확인하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onNavigate('/settings')}
              variant="outline"
              className="flex-1"
            >
              관심 종목 수정
            </Button>
            <Button onClick={() => onNavigate('/')} className="flex-1 bg-blue-600 hover:bg-blue-700">
              다시 확인
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'empty') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <FileX className="w-8 h-8 text-slate-400" />
            </div>
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-slate-900">데이터 축적 중</h2>
            <p className="text-sm text-slate-600">
              아직 쌓인 추천 이력이 없습니다.
            </p>
            <p className="text-sm text-slate-600">
              추천 카드가 평가되면 성공과 실패 기록이 여기에 표시됩니다.
            </p>
          </div>
          <Button onClick={() => onNavigate('/')} className="w-full bg-blue-600 hover:bg-blue-700">
            홈으로 이동
          </Button>
        </div>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <ServerCrash className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-slate-900">잠시 후 다시 확인해주세요</h2>
            <p className="text-sm text-slate-600">
              외부 데이터 응답이 지연되고 있습니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
              다시 시도
            </Button>
            <Button onClick={() => onNavigate('/')} className="flex-1 bg-blue-600 hover:bg-blue-700">
              홈으로 이동
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
