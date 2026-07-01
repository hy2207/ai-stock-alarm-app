import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { prisma } from "@/lib/prisma";
import { Disclaimer } from "@/app/components/Disclaimer";
import { ProfileEditForm } from "@/app/components/ProfileEditForm";

export default async function ProfileSettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login?callbackUrl=/settings/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, timezone: true },
  });

  if (!user) {
    redirect("/login");
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
          <h1 className="text-xl font-semibold">프로필 수정</h1>
          <p className="mt-1 text-sm text-slate-600">
            표시 이름과 타임존을 변경할 수 있습니다.
          </p>

          <div className="mt-6">
            <ProfileEditForm
              initialName={user.name ?? ""}
              initialTimezone={user.timezone}
              email={user.email}
            />
          </div>
        </section>

        <Disclaimer />
      </div>
    </main>
  );
}
