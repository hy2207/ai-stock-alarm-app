import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { AlertCircle, FileX, ServerCrash, Sparkles } from 'lucide-react';
import { ROUTES } from '../routes';

interface StatePageV2Props {
  type: 'no-call' | 'loading' | 'empty' | 'error';
  onNavigate: (route: string) => void;
}

export function StatePageV2({ type, onNavigate }: StatePageV2Props) {
  if (type === 'loading') {
    return (
      <div className="min-h-screen bg-[#f7f8f5] p-4">
        <div className="max-w-4xl mx-auto space-y-6 pt-8">
          <div className="border border-slate-200 bg-white rounded-lg p-6 space-y-4">
            <Skeleton className="h-12 w-64 rounded-lg" />
            <Skeleton className="h-6 w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'no-call') {
    return (
      <div className="min-h-screen bg-[#f7f8f5] flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-slate-200 bg-white rounded-lg shadow-sm p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-amber-600 rounded-lg flex items-center justify-center shadow-sm">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-slate-950">
              오늘은 명확한 추천을 만들지 않았습니다
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              가격 데이터와 뉴스 신호가 충분히 정렬되지 않아 무리한 판단을 피했습니다.
            </p>
            <p className="text-sm text-slate-600">
              관심 종목을 조정하거나 내일 아침 브리핑을 확인하세요.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onNavigate(ROUTES.settings)}
              variant="outline"
              className="rounded-lg border-2"
            >
              관심 종목 수정
            </Button>
            <Button
              onClick={() => onNavigate(ROUTES.home)}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              다시 확인
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'empty') {
    return (
      <div className="min-h-screen bg-[#f7f8f5] flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-slate-200 bg-white rounded-lg shadow-sm p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center shadow-sm">
              <FileX className="w-10 h-10 text-slate-400" />
            </div>
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-slate-950">
              데이터 축적 중
            </h2>
            <p className="text-sm text-slate-700">
              아직 쌓인 추천 이력이 없습니다.
            </p>
            <p className="text-sm text-slate-600">
              추천 카드가 평가되면 성공과 실패 기록이 여기에 표시됩니다.
            </p>
          </div>
          <Button
            onClick={() => onNavigate(ROUTES.home)}
            className="w-full rounded-lg h-12 bg-slate-950 hover:bg-slate-800 shadow-sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            홈으로 이동
          </Button>
        </div>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="min-h-screen bg-[#f7f8f5] flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-slate-200 bg-white rounded-lg shadow-sm p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-rose-600 rounded-lg flex items-center justify-center shadow-sm">
              <ServerCrash className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-slate-950">
              잠시 후 다시 확인해주세요
            </h2>
            <p className="text-sm text-slate-700">
              외부 데이터 응답이 지연되고 있습니다.
            </p>
            <p className="text-xs text-slate-500">
              일시적인 문제일 수 있습니다. 잠시 후 다시 시도해주세요.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="rounded-lg border-2"
            >
              다시 시도
            </Button>
            <Button
              onClick={() => onNavigate(ROUTES.home)}
              className="rounded-lg bg-rose-600 hover:bg-rose-700 shadow-sm"
            >
              홈으로 이동
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
