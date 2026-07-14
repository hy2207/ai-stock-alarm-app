import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { Disclaimer } from "@/app/components/Disclaimer";
import { PushConsentToggle } from "@/app/components/PushConsentToggle";
import { prisma } from "@/lib/prisma";

export default async function NotificationsSettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login?callbackUrl=/settings/notifications");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { consentPush: true },
  });

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

          <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <PushConsentToggle initialConsent={user?.consentPush ?? false} />
          </div>
        </section>

        <Disclaimer />
      </div>
    </main>
  );
}
