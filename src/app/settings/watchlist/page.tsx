import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { getUserWatchlist } from "@/lib/queries/getUserWatchlist";
import { Disclaimer } from "@/app/components/Disclaimer";
import { WatchlistEditorForm } from "@/app/components/WatchlistEditorForm";
import { getTop50Tickers } from "@/app/components/Top50Grid";
import { prisma } from "@/lib/prisma";

export default async function WatchlistSettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login?callbackUrl=/settings/watchlist");
  }

  const [watchlist, top50] = await Promise.all([
    getUserWatchlist(userId),
    getTop50Tickers(),
  ]);

  // Build initialSelected: match saved tickers to names from universe or top50
  const initialSelected = await Promise.all(
    watchlist
      .filter((item) => item.ticker)
      .map(async (item) => {
        const universe = await prisma.tickerUniverse.findUnique({
          where: { ticker: item.ticker! },
          select: { name: true },
        });
        return {
          ticker: item.ticker!,
          name: universe?.name ?? item.ticker!,
        };
      }),
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950">
      <div className="mx-auto max-w-2xl py-8">
        <Link
          href="/settings"
          className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          ← 설정으로
        </Link>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">관심 종목 설정</h1>
          <p className="mt-1 text-sm text-slate-600">
            최대 3개까지 선택할 수 있으며, 변경 사항은 다음 추천 생성부터 반영됩니다.
          </p>

          <div className="mt-6">
            <WatchlistEditorForm
              initialSelected={initialSelected}
              top50={top50}
            />
          </div>
        </section>

        <Disclaimer />
      </div>
    </main>
  );
}
