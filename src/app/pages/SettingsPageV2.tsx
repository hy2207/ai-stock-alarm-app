import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { availableWatchlistItems, mockUser } from '../mockData';
import { NavigationV2 } from '../components/NavigationV2';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import type { RiskProfile } from '../types';
import { toast } from 'sonner';
import { Settings as SettingsIcon, User, Bell, Shield, LogOut, Trash2, TestTube, Check } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { ROUTES } from '../routes';
import {
  getSettingsWatchlistEditState,
  toggleOnboardingSelection,
} from '../lib/onboardingSelection';

interface SettingsPageV2Props {
  onNavigate: (route: string) => void;
}

export function SettingsPageV2({ onNavigate }: SettingsPageV2Props) {
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

  useEffect(() => {
    setLocalRiskProfile(riskProfile);
  }, [riskProfile]);

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
      onNavigate(ROUTES.login);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      toast.error('계정 삭제는 데모에서 지원하지 않습니다.');
      addDebugEvent('account_delete_attempt');
    }
  };

  const riskOptions: { value: RiskProfile; label: string; color: string }[] = [
    { value: 'conservative', label: '안정형', color: 'bg-emerald-600' },
    { value: 'balanced', label: '중립형', color: 'bg-blue-600' },
    { value: 'aggressive', label: '공격형', color: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8f5]">
      <NavigationV2 currentRoute={ROUTES.settings} onNavigate={onNavigate} />

      <div className="max-w-5xl mx-auto p-4 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-6 pt-4">
          <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-950 rounded-lg flex items-center justify-center shadow-sm">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-950">
                  설정
                </h1>
                <p className="text-sm text-slate-600">앱 환경 설정</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Profile */}
          <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-orange-600" />
              <h2 className="font-bold text-slate-900">프로필</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 px-4 bg-[#f7f8f5] rounded-lg">
                <span className="text-sm text-slate-600">이름</span>
                <span className="font-medium text-slate-900">{mockUser.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 px-4 bg-[#f7f8f5] rounded-lg">
                <span className="text-sm text-slate-600">시간대</span>
                <span className="font-medium text-slate-900">{mockUser.timezone}</span>
              </div>
            </div>
          </div>

          {/* Watchlist */}
          <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900">관심 종목</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              현재 선택: {watchlistEditState.selectedLabel} ({watchlistEditState.count}/{watchlistEditState.max})
            </p>
            <p className="text-xs text-slate-500 mb-4">
              종목과 섹터를 함께 고를 수 있으며, 이 선택은 홈 카드와 이력 필터에 같이 반영됩니다.
            </p>
            {watchlistEditState.validationMessage && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                최소 1개, 최대 3개까지 선택할 수 있습니다.
              </p>
            )}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {availableWatchlistItems.map(({ ticker, name, kind }) => {
                const isSelected = editingWatchlist.includes(ticker);
                return (
                  <button
                    key={ticker}
                    onClick={() => toggleWatchlistItem(ticker)}
                    className="relative p-3 rounded-lg transition-all"
                  >
                    <div className={`absolute inset-0 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-slate-950'
                        : 'bg-white border-2 border-slate-200'
                    }`} />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                    )}
                    <div className="relative">
                      <div className="flex items-center justify-center gap-1">
                        <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {ticker}
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${isSelected ? 'border-white/30 bg-white/10 text-white' : ''}`}
                        >
                          {kind === 'ticker' ? '종목' : '섹터'}
                        </Badge>
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-slate-600'}`}>
                        {name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <Button
              onClick={handleSaveWatchlist}
              disabled={!watchlistEditState.canSave}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              저장
            </Button>
          </div>

          {/* Risk Profile */}
          <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-slate-900">기본 리스크 성향</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {riskOptions.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => {
                    setLocalRiskProfile(value);
                    setRiskProfile(value);
                    toast.success('리스크 성향이 변경되었습니다.');
                    addDebugEvent('risk_profile_change', { from: riskProfile, to: value });
                  }}
                  className={`relative overflow-hidden rounded-lg border p-4 transition-all ${
                    localRiskProfile === value
                      ? 'border-slate-950 bg-slate-950 shadow-sm'
                      : 'border-slate-200 bg-[#f7f8f5] hover:bg-white'
                  }`}
                >
                  <div className="relative">
                    <div className={`flex items-center justify-center gap-2 text-sm font-medium ${
                      localRiskProfile === value ? 'text-white' : 'text-slate-900'
                    }`}>
                      <span className={`size-2 rounded-full ${color}`} />
                      {label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Push Notifications */}
          <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-slate-900">푸시 알림</h2>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-slate-900 mb-1">아침 브리핑</div>
                <p className="text-xs text-slate-600">
                  미국장 시작 전 오늘의 추천 후보를 알려드립니다
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
              <div className="mt-3 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                브라우저 알림 권한이 꺼져 있습니다. 브라우저 설정에서 다시 허용할 수 있습니다.
              </div>
            )}
          </div>

          {/* Test States */}
          <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <TestTube className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900">상태 화면 테스트</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => onNavigate(ROUTES.stateNoCall)}
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                No Call
              </Button>
              <Button
                onClick={() => onNavigate(ROUTES.stateLoading)}
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                Loading
              </Button>
              <Button
                onClick={() => onNavigate(ROUTES.stateEmpty)}
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                Empty
              </Button>
              <Button
                onClick={() => onNavigate(ROUTES.stateError)}
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                Error
              </Button>
            </div>
          </div>

          {/* Account */}
          <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <LogOut className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-slate-900">계정 관리</h2>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full rounded-lg border-2"
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
              <Button
                onClick={handleDeleteAccount}
                variant="destructive"
                className="w-full rounded-lg bg-rose-600 hover:bg-rose-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                계정 삭제
              </Button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-slate-500 mt-6 border border-slate-200 bg-white rounded-lg p-4 space-y-1">
          <p>투자 참고용 정보이며 투자 자문이 아닙니다.</p>
          <p>실제 투자 결정과 책임은 사용자에게 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
