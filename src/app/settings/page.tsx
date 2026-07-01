import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { Disclaimer } from "@/app/components/Disclaimer";

const SETTINGS_MENU = [
  {
    href: "/settings/profile",
    title: "프로필 수정",
    description: "표시 이름, 타임존 변경",
    icon: "👤",
  },
  {
    href: "/settings/notifications",
    title: "알림 설정",
    description: "아침 브리핑 푸시 알림 관리",
    icon: "🔔",
  },
  {
    href: "/settings/watchlist",
    title: "관심 종목",
    description: "추천 카드를 생성할 종목 선택 (최대 3개)",
    icon: "📈",
  },
];

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login?callbackUrl=/settings");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950">
      <div className="mx-auto max-w-2xl py-8">
        <h1 className="text-2xl font-semibold">설정</h1>
        <p className="mt-1 text-sm text-slate-600">계정 및 서비스 환경을 관리합니다.</p>

        <nav className="mt-6 space-y-3">
          {SETTINGS_MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
                </div>
              </div>
              <span className="text-slate-300">›</span>
            </Link>
          ))}
        </nav>

        <Disclaimer />
      </div>
    </main>
  );
}
