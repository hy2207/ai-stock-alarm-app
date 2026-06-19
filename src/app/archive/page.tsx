import Link from "next/link";
import { Disclaimer } from "@/app/components/Disclaimer";
import { PostHogEvent } from "@/app/components/PostHogEvent";
import { getPerformanceRecords } from "@/lib/queries/getPerformanceRecords";

export default async function ArchivePage() {
  const { records, totalCount } = await getPerformanceRecords();
  const completed = records.filter((record) => record.hitFlag != null);
  const wins = completed.filter((record) => record.hitFlag === true).length;
  const successRate = completed.length > 0 ? Math.round((wins / completed.length) * 100) : null;

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-950">
      <div className="mx-auto max-w-3xl py-8">
        <Link href="/" className="text-sm font-medium text-blue-700">
          홈으로
        </Link>
        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">추천 이력</h1>
          <p className="mt-1 text-sm text-slate-600">성공과 실패를 포함한 최근 성과 기록입니다.</p>

          <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-500">총 기록</dt>
              <dd className="font-semibold">{totalCount}</dd>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3">
              <dt className="text-slate-500">성공률</dt>
              <dd className="font-semibold text-emerald-700">
                {successRate == null ? "데이터 축적 중" : `${successRate}%`}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <dt className="text-slate-500">표시 범위</dt>
              <dd className="font-semibold">최근 30일</dd>
            </div>
          </dl>
        </section>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {records.length === 0 ? (
            <p className="text-sm text-slate-600">데이터 축적 중입니다.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {records.map((record) => (
                <article key={record.id} className="py-4">
                  <PostHogEvent
                    event="performance_card_view"
                    properties={{ recId: record.recId, ticker: record.ticker }}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{record.ticker}</h2>
                      <p className="text-sm text-slate-600">{record.predictedDirection}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{record.realizedReturn == null ? "평가 중" : `${record.realizedReturn}%`}</p>
                      <p className="text-slate-500">
                        {record.hitFlag === true ? "성공" : record.hitFlag === false ? "실패" : "평가 중"}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <Disclaimer />
      </div>
    </main>
  );
}
