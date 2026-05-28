import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { setIsLoggedIn, addDebugEvent } = useApp();

  const handleLogin = () => {
    addDebugEvent('login_attempt');
    setIsLoggedIn(true);
    onNavigate('/onboarding');
  };

  const handleDemoHome = () => {
    addDebugEvent('demo_home_click');
    setIsLoggedIn(true);
    onNavigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-slate-900">AI Stock Alarm</h1>
          <p className="text-slate-900">아침 3분, 오늘의 미국주식 판단</p>
          <p className="text-sm text-slate-600">
            차트 없이 방향, 가격, 보유 기간, 근거를 한 장으로 확인하세요.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <Button
            onClick={handleLogin}
            className="w-full bg-white text-slate-900 border border-slate-300 hover:bg-slate-50"
          >
            Google로 계속하기
          </Button>

          <Button
            onClick={handleLogin}
            className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-500"
          >
            Kakao로 계속하기
          </Button>

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="이메일 주소"
              className="w-full"
            />
            <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700">
              이메일로 계속하기
            </Button>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleDemoHome}
              variant="outline"
              className="w-full"
            >
              데모로 홈 보기
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>투자 참고용 정보이며 투자 자문이 아닙니다.</p>
          <p>실제 투자 결정과 책임은 사용자에게 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
