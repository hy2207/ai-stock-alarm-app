import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { LoginProviderButtons } from "./LoginProviderButtons";
import { getSafeCallbackUrl } from "./utils";

type LoginPageProps = {
  searchParams?: {
    callbackUrl?: string | string[];
    returnTo?: string | string[];
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const callbackUrl = getSafeCallbackUrl(
    searchParams?.callbackUrl ?? searchParams?.returnTo,
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-6">
          <a href="/" className="text-sm font-medium text-blue-700">
            ← 홈으로
          </a>
        </div>
        <section className="mb-6 space-y-3 text-center">
          <p className="text-sm font-medium text-slate-500">AI Stock Alarm</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            추천을 보려면 로그인이 필요합니다
          </h1>
          <p className="text-sm text-slate-600">
            관심 목록, 리스크 모드, 추천 이력과 아침 브리핑을 안전하게
            이어가기 위해 로그인해 주세요.
          </p>
        </section>

        <Card className="rounded-lg bg-white shadow-sm">
          <CardHeader>
            <CardTitle>로그인</CardTitle>
            <CardDescription>
              Google 또는 Kakao 계정으로 Decision Layer를 계속 사용합니다.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <LoginProviderButtons callbackUrl={callbackUrl} />
          </CardContent>

          <CardFooter className="flex-col gap-2 border-t text-center text-xs text-slate-500">
            <p>서비스 제공에 필요한 최소 정보만 저장합니다.</p>
            <p>투자 참고용 정보이며 투자 자문이 아닙니다.</p>
            <p>이 서비스는 브로커 주문 실행을 제공하지 않습니다.</p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
