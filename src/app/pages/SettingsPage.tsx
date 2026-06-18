import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { availableWatchlistItems, mockUser } from '../mockData';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import type { RiskProfile } from '../types';
import { toast } from 'sonner';
import {
  getSettingsWatchlistEditState,
  toggleOnboardingSelection,
} from '../lib/onboardingSelection';

interface SettingsPageProps {
  onNavigate: (route: string) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const {
    watchlist,
    setWatchlist,
    riskProfile,
    setRiskProfile,
    pushEnabled,
    setPushEnabled,
    setIsLoggedIn,
    addDebugEvent,
  } = useApp();

  const [editingWatchlist, setEditingWatchlist] = useState<string[]>(watchlist);
  const [localRiskProfile, setLocalRiskProfile] = useState<RiskProfile>(riskProfile);
  const watchlistEditState = getSettingsWatchlistEditState(watchlist, editingWatchlist);

  useEffect(() => {
    addDebugEvent('settings_view');
  }, []);

  useEffect(() => {
    setEditingWatchlist(watchlist);
  }, [watchlist]);

  const toggleWatchlistItem = (ticker: string) => {
    const nextWatchlist = toggleOnboardingSelection(editingWatchlist, ticker);

    if (nextWatchlist === editingWatchlist) {
      toast.error('최대 3개까지 선택 가능합니다.');
      return;
    }

    setEditingWatchlist(nextWatchlist);
  };

  const handleSaveWatchlist = () => {
    if (watchlistEditState.validationMessage) {
      toast.error('최소 1개 이상 선택해야 합니다.');
      return;
    }
    if (!watchlistEditState.hasChanges) {
      toast.info('변경된 관심 종목이 없습니다.');
      return;
    }

    setWatchlist(editingWatchlist);
    toast.success('변경사항이 저장되었습니다. 다음 추천부터 반영됩니다.');
    addDebugEvent('watchlist_saved', { watchlist: editingWatchlist });
  };

  const handleLogout = () => {
    if (confirm('로그아웃하시겠습니까?')) {
      setIsLoggedIn(false);
      addDebugEvent('logout');
      onNavigate('/login');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      toast.error('계정 삭제는 데모에서 지원하지 않습니다.');
      addDebugEvent('account_delete_attempt');
    }
  };

  const riskOptions: { value: RiskProfile; label: string }[] = [
    { value: 'conservative', label: '안정형' },
    { value: 'balanced', label: '중립형' },
    { value: 'aggressive', label: '공격형' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="hidden md:block">
        <Navigation currentRoute="/settings" onNavigate={onNavigate} />
      </div>

      <div className="max-w-4xl mx-auto p-4 pb-20 md:pb-8 space-y-6">
        <h1 className="text-slate-900">설정</h1>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-slate-900">프로필 요약</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">이름</span>
              <span className="text-slate-900">{mockUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">시간대</span>
              <span className="text-slate-900">{mockUser.timezone}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 className="text-slate-900">관심 종목 설정</h2>
          <p className="text-sm text-slate-600">
            현재 선택: {watchlistEditState.selectedLabel} ({watchlistEditState.count}/{watchlistEditState.max})
          </p>
          {watchlistEditState.validationMessage && (
            <p className="text-xs text-amber-600">
              최소 1개, 최대 3개까지 선택할 수 있습니다.
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableWatchlistItems.map(({ ticker, name }) => {
              const isSelected = editingWatchlist.includes(ticker);
              return (
                <button
                  key={ticker}
                  onClick={() => toggleWatchlistItem(ticker)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="text-slate-900">{ticker}</div>
                  <div className="text-xs text-slate-600">{name}</div>
                </button>
              );
            })}
          </div>
          <Button
            onClick={handleSaveWatchlist}
            disabled={!watchlistEditState.canSave}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            저장
          </Button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 className="text-slate-900">기본 리스크 성향</h2>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
            {riskOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => {
                  setLocalRiskProfile(value);
                  setRiskProfile(value);
                  toast.success('리스크 성향이 변경되었습니다.');
                  addDebugEvent('risk_profile_change', { from: riskProfile, to: value });
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm transition-all ${
                  localRiskProfile === value
                    ? 'bg-white text-slate-900 shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 className="text-slate-900">푸시 수신</h2>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm text-slate-900">아침 브리핑 받기</div>
              <p className="text-xs text-slate-500">
                미국장 시작 전 오늘의 추천 후보를 알려드립니다.
              </p>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={(checked) => {
                setPushEnabled(checked);
                toast.success(checked ? '푸시 알림이 활성화되었습니다.' : '푸시 알림이 비활성화되었습니다.');
                addDebugEvent('push_toggle', { enabled: checked });
              }}
            />
          </div>
          {!pushEnabled && (
            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded">
              브라우저 알림 권한이 꺼져 있습니다. 브라우저 설정에서 다시 허용할 수 있습니다.
            </p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-slate-900">상태 화면 테스트</h2>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => onNavigate('/state/no-call')}
              variant="outline"
              size="sm"
            >
              No Call
            </Button>
            <Button
              onClick={() => onNavigate('/state/loading')}
              variant="outline"
              size="sm"
            >
              Loading
            </Button>
            <Button
              onClick={() => onNavigate('/state/empty')}
              variant="outline"
              size="sm"
            >
              Empty
            </Button>
            <Button
              onClick={() => onNavigate('/state/error')}
              variant="outline"
              size="sm"
            >
              Error
            </Button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <h2 className="text-slate-900">계정</h2>
          <div className="space-y-2">
            <Button onClick={handleLogout} variant="outline" className="w-full">
              로그아웃
            </Button>
            <Button
              onClick={handleDeleteAccount}
              variant="destructive"
              className="w-full"
            >
              계정 삭제
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-4 space-y-1">
          <p>투자 참고용 정보이며 투자 자문이 아닙니다.</p>
          <p>실제 투자 결정과 책임은 사용자에게 있습니다.</p>
        </div>
      </div>

      <div className="md:hidden">
        <Navigation currentRoute="/settings" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
