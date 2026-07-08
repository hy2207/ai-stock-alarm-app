import { redirect } from "next/navigation";
import { getTodayRecommendations } from "@/lib/queries/getTodayRecommendations";
import { getUserWatchlist } from "@/lib/queries/getUserWatchlist";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { Disclaimer } from "@/app/components/Disclaimer";
import { TodayCardAutoLoader } from "@/app/components/TodayCardAutoLoader";
import { RefreshCardsButton } from "@/app/components/RefreshCardsButton";
import { PostHogEvent } from "@/app/components/PostHogEvent";
import { RiskModeRecommendationList } from "@/app/components/RiskModeRecommendationList";

interface TodayPageProps {
  searchParams?: {
    from?: string;
    utm_source?: string;
  };
}

export default async function TodayPage({ searchParams }: TodayPageProps) {
  const userId = await getCurrentUserId();

  // Middleware guards this route, but double-check for safety
  if (!userId) {
    redirect("/login?callbackUrl=/today");
  }

  const [watchlist, result] = await Promise.all([
    getUserWatchlist(userId),
    getTodayRecommendations(userId),
  ]);

  if (watchlist.length === 0) {
    redirect("/onboarding");
  }
  const fromPush =
    searchParams?.from === "push" || searchParams?.utm_source === "onesignal";

  const todayLabel = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  });

  if (result.status === "no_call") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-slate-950">
        <PostHogEvent event="home_view" properties={{ state: "no_call" }} />
        {fromPush && (
          <>
            <PostHogEvent event="push_open" properties={{ route: "/today" }} />
            <PostHogEvent event="deeplink_success" properties={{ route: "/today" }} />
          </>
        )}
        <p className="mb-1 text-xs font-medium text-slate-400">{todayLabel}</p>
        <h1 className="mb-2 text-xl font-semibold">오늘 추천 카드를 준비하고 있습니다</h1>
        <p className="max-w-sm text-center text-sm text-slate-500">
          관심 종목을 기반으로 시장 데이터를 분석합니다.
        </p>
        <TodayCardAutoLoader />
        <Disclaimer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950">
      <PostHogEvent event="home_view" properties={{ state: "ok" }} />
      {fromPush && (
        <>
          <PostHogEvent event="push_open" properties={{ route: "/today" }} />
          <PostHogEvent event="deeplink_success" properties={{ route: "/today" }} />
        </>
      )}
      <div className="mx-auto max-w-3xl py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-400">{todayLabel}</p>
            <h1 className="mt-0.5 text-2xl font-semibold">오늘의 의사결정 카드</h1>
            <p className="mt-1 text-sm text-slate-600">관심 종목 기준 3개 이하로 압축했습니다.</p>
          </div>
          <RefreshCardsButton />
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
