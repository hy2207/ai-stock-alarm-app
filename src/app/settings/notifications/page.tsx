import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { Disclaimer } from "@/app/components/Disclaimer";

export default async function NotificationsSettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login?callbackUrl=/settings/notifications");
  }

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
          <h1 className="text-xl font-semibold">알림 설정</h1>
          <p className="mt-1 text-sm text-slate-600">
            브라우저 푸시 알림을 허용하면 매일 아침 브리핑을 받을 수 있습니다.
          </p>

          {/* PUSH_DISABLED: replace this block with <PushConsentToggle> when OneSignal is configured */}
          <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div>
              <p className="text-sm font-medium text-slate-700">아침 브리핑 푸시 알림</p>
              <p className="mt-0.5 text-xs text-slate-500">매일 오전 8시 추천 카드 알림</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">준비 중</span>
              <button
                type="button"
                disabled
                aria-label="알림 설정 (준비 중)"
                className="relative inline-flex h-6 w-11 cursor-not-allowed items-center rounded-full bg-slate-200 opacity-50"
              >
                <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white shadow" />
              </button>
            </div>
          </div>
        </section>

        <Disclaimer />
      </div>
    </main>
  );
}
