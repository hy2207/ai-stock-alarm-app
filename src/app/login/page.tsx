import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { getSafeReturnTo } from "./utils";

type LoginPageProps = {
  searchParams?: {
    returnTo?: string | string[];
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const callbackUrl = getSafeReturnTo(searchParams?.returnTo);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <section className="mb-6 space-y-3 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            AI Stock Alarm
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            추천을 보려면 로그인이 필요합니다
          </h1>
          <p className="text-sm text-muted-foreground">
            관심 목록, 리스크 모드, 추천 이력과 아침 브리핑을 안전하게
            이어가기 위해 로그인해 주세요.
          </p>
        </section>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>로그인</CardTitle>
            <CardDescription>
              Google을 기본 선택지로 제공하고, Kakao와 이메일 로그인을 함께
              제공합니다.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form action="/api/auth/signin/google" method="post">
              <input name="callbackUrl" type="hidden" value={callbackUrl} />
              <Button className="h-11 w-full" type="submit" variant="outline">
                Google로 계속하기
              </Button>
            </form>

            <form action="/api/auth/signin/kakao" method="post">
              <input name="callbackUrl" type="hidden" value={callbackUrl} />
              <Button className="h-11 w-full" type="submit" variant="outline">
                Kakao로 계속하기
              </Button>
            </form>

            <div className="relative py-1 text-center text-xs text-muted-foreground">
              <span className="bg-card px-2">또는</span>
            </div>

            <form action="/api/auth/signin/email" className="space-y-3" method="post">
              <input name="callbackUrl" type="hidden" value={callbackUrl} />
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  autoComplete="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                />
              </div>
              <Button className="h-11 w-full" type="submit">
                이메일로 계속하기
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-2 border-t text-center text-xs text-muted-foreground">
            <p>서비스 제공에 필요한 최소 정보만 저장합니다.</p>
            <p>투자 참고용 정보이며 투자 자문이 아닙니다.</p>
            <p>이 서비스는 브로커 주문 실행을 제공하지 않습니다.</p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
