import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Sparkles, Shield, Zap } from 'lucide-react';
import { StockAlarmBrand } from '../components/StockAlarmBrand';
import { ROUTES } from '../routes';

interface LoginPageV2Props {
  onNavigate: (route: string) => void;
}

export function LoginPageV2({ onNavigate }: LoginPageV2Props) {
  const { setIsLoggedIn, addDebugEvent } = useApp();

  const handleLogin = () => {
    addDebugEvent('login_attempt');
    setIsLoggedIn(true);
    onNavigate(ROUTES.onboarding);
  };

  const handleDemoHome = () => {
    addDebugEvent('demo_home_click');
    setIsLoggedIn(true);
    onNavigate(ROUTES.home);
  };

  return (
    <div className="min-h-screen bg-[#f7f8f5]">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center space-y-6 mb-8">
            <StockAlarmBrand variant="hero" className="drop-shadow-sm" />
            <div className="space-y-3">
              <p className="text-xl text-slate-700">
                아침 3분, 오늘의 미국주식 판단
              </p>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                차트 없이 방향, 가격, 보유 기간, 근거를 한 장으로 확인하세요
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="border border-slate-200 bg-white rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-slate-600">AI 추천</p>
            </div>
            <div className="border border-slate-200 bg-white rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-xs text-slate-600">실시간</p>
            </div>
            <div className="border border-slate-200 bg-white rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs text-slate-600">신뢰도</p>
            </div>
          </div>

          {/* Login Card */}
          <div className="border border-slate-200 bg-white rounded-lg shadow-sm p-8 space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm h-12 rounded-lg transition-all"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 계속하기
            </Button>

            <Button
              onClick={handleLogin}
              className="w-full bg-[#FEE500] text-slate-900 hover:bg-[#FDD835] shadow-sm h-12 rounded-lg transition-all border-0"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#000000" d="M12 3c2.21 0 4 1.79 4 4 0 1.5-.81 2.77-2 3.46v1.54h4v2h-4v8h-4v-8H6v-2h4V9.54C8.81 8.77 8 7.5 8 6c0-2.21 1.79-4 4-4z"/>
              </svg>
              Kakao로 계속하기
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-500">또는</span>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                type="email"
                placeholder="이메일 주소"
                className="w-full h-12 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-12 rounded-lg transition-all"
              >
                이메일로 계속하기
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Button
                onClick={handleDemoHome}
                variant="ghost"
                className="w-full h-12 rounded-lg hover:bg-slate-100"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                데모로 홈 보기
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-500 mt-6 space-y-1 border border-slate-200 bg-white rounded-lg p-4">
            <p>투자 참고용 정보이며 투자 자문이 아닙니다.</p>
            <p>실제 투자 결정과 책임은 사용자에게 있습니다.</p>
            <p>프로토타입에서는 로그인 상태와 설정이 이 브라우저에 임시 저장됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
