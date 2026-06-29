import { redirect } from "next/navigation";
import Link from "next/link";
import { getTodayRecommendations } from "@/lib/queries/getTodayRecommendations";
import { getUserWatchlist, userHasWatchlist } from "@/lib/queries/getUserWatchlist";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { Disclaimer } from "./components/Disclaimer";
import { DevRecommendationGenerator } from "./components/DevRecommendationGenerator";
import { PostHogEvent } from "./components/PostHogEvent";
import { RiskModeRecommendationList } from "./components/RiskModeRecommendationList";
import { LandingPage } from "./components/LandingPage";

interface HomeProps {
  searchParams?: {
    from?: string;
    utm_source?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const userId = await getCurrentUserId();

  // Unauthenticated visitors see the landing page
  if (!userId) {
    return <LandingPage />;
  }

  if (!(await userHasWatchlist(userId))) {
    redirect("/onboarding");
  }

  const watchlist = userId ? await getUserWatchlist(userId) : [];
  const result = await getTodayRecommendations();
  const fromPush =
    searchParams?.from === "push" || searchParams?.utm_source === "onesignal";

  if (result.status === "no_call") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-slate-950">
        <PostHogEvent event="home_view" properties={{ state: "no_call" }} />
        {fromPush && (
          <>
            <PostHogEvent event="push_open" properties={{ route: "/" }} />
            <PostHogEvent event="deeplink_success" properties={{ route: "/" }} />
          </>
        )}
        <h1 className="mb-2 text-2xl font-semibold">오늘은 명확한 추천을 만들지 않았습니다</h1>
        <p className="max-w-sm text-center text-sm text-slate-600">
          {result.reason}
        </p>
        <DevRecommendationGenerator />
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
          <Link href="/settings" className="font-medium text-blue-700">
            관심 종목 변경
          </Link>
          <Link href="/archive" className="font-medium text-blue-700">
            추천 이력
          </Link>
        </div>
        <Disclaimer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950">
      <PostHogEvent event="home_view" properties={{ state: "ok" }} />
      {fromPush && (
        <>
          <PostHogEvent event="push_open" properties={{ route: "/" }} />
          <PostHogEvent event="deeplink_success" properties={{ route: "/" }} />
        </>
      )}
      <div className="mx-auto max-w-3xl py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">오늘의 의사결정 카드</h1>
          <p className="mt-1 text-sm text-slate-600">관심 종목 기준 3개 이하로 압축했습니다.</p>
        </div>

        <RiskModeRecommendationList
          cards={result.cards}
          initialRiskMode={result.selectedRiskMode}
          watchlistTickers={watchlist.map((item) => item.ticker)}
        />
        <Disclaimer />
      </div>
    </main>
  );
}
