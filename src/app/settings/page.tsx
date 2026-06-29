import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { getUserWatchlist } from "@/lib/queries/getUserWatchlist";
import { prisma } from "@/lib/prisma";
import { Disclaimer } from "@/app/components/Disclaimer";
import { WatchlistPickerForm } from "@/app/components/WatchlistPickerForm";
import { PushConsentToggle } from "@/app/components/PushConsentToggle";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login?callbackUrl=/settings");
  }

  const [watchlist, user] = await Promise.all([
    getUserWatchlist(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { consentPush: true },
    }),
  ]);

  const initialSelected = watchlist.map((item) => item.ticker);
  const initialConsent = user?.consentPush ?? false;

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950">
      <div className="mx-auto max-w-2xl py-8">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">관심 종목 설정</h1>
          <p className="mt-1 text-sm text-slate-600">
            변경 사항은 다음 추천 생성부터 반영됩니다.
          </p>

          <div className="mt-6">
            <WatchlistPickerForm
              initialSelected={initialSelected}
              submitLabel="변경사항 저장"
              successMessage="관심 종목이 업데이트되었습니다."
              redirectTo="/settings"
            />
          </div>
        </section>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">알림 설정</h2>
          <p className="mt-1 text-sm text-slate-600">
            브라우저 푸시 알림을 허용하면 매일 아침 브리핑을 받을 수 있습니다.
          </p>
          <div className="mt-6">
            <PushConsentToggle initialConsent={initialConsent} />
          </div>
        </section>

        <Disclaimer />
      </div>
    </main>
  );
}
