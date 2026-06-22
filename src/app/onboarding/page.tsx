import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { userHasWatchlist } from "@/lib/queries/getUserWatchlist";
import { Disclaimer } from "@/app/components/Disclaimer";
import { WatchlistPickerForm } from "@/app/components/WatchlistPickerForm";

export default async function OnboardingPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login?callbackUrl=/onboarding");
  }

  if (await userHasWatchlist(userId)) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950">
      <div className="mx-auto max-w-2xl py-8">
        <WatchlistPickerForm
          submitLabel="선택 완료"
          successMessage="관심 종목이 저장되었습니다."
        />
        <Disclaimer />
      </div>
    </main>
  );
}
