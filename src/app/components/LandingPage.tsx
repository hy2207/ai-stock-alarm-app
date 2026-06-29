import Link from "next/link";

const SAMPLE_CARDS = [
  {
    ticker: "NVDA",
    direction: "BUY",
    entry: "$118.40",
    target: "$128.00",
    hold: "3일",
    reason: "데이터센터 수요 회복과 거래량 증가로 단기 상승 가능성",
    mode: "중립형",
  },
  {
    ticker: "TSLA",
    direction: "SELL",
    entry: "$248.00",
    target: "$230.00",
    hold: "4일",
    reason: "인도 수치 하향과 단기 과매수 구간 진입",
    mode: "공격형",
  },
] as const;

const FEATURES = [
  {
    title: "행동 카드 한 장",
    body: "BUY/SELL, 진입가, 목표가, 손절가, 보유 기간을 한 화면에 — 고민 없이 판단만 합니다.",
  },
  {
    title: "리스크 모드 3단계",
    body: "안정형·중립형·공격형 선택 시 같은 종목도 진입 범위와 매도 기준이 달라집니다.",
  },
  {
    title: "No Call 정직 고지",
    body: "시장 신호가 불분명하면 추천하지 않습니다. 빈 카드 대신 이유를 보여줍니다.",
  },
  {
    title: "실적 이력 공개",
    body: "성공·실패 기록을 모두 보여줍니다. 과거 적중률과 실현 수익률을 숨기지 않습니다.",
  },
] as const;

function SampleCard({
  card,
}: {
  card: (typeof SAMPLE_CARDS)[number];
}) {
  const isBuy = card.direction === "BUY";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold">{card.ticker}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{card.mode}</span>
          <span
            className={`rounded px-2 py-0.5 text-xs font-bold ${
              isBuy ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
          >
            {card.direction}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-slate-50 p-2">
          <p className="text-slate-400">진입가</p>
          <p className="mt-0.5 font-semibold">{card.entry}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <p className="text-slate-400">목표가</p>
          <p className="mt-0.5 font-semibold">{card.target}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <p className="text-slate-400">보유기간</p>
          <p className="mt-0.5 font-semibold">{card.hold}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">{card.reason}</p>
    </div>
  );
}

export function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Nav */}
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <p className="text-sm font-semibold tracking-tight">AI Stock Alarm</p>
        <Link
          href="/login"
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          로그인
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 py-14 text-center">
        <p className="text-sm font-medium text-blue-600">Decision Layer · 미국 주식</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight leading-tight">
          오늘 살지, 팔지, 기다릴지<br />
          <span className="text-blue-600">3분 안에 정하세요</span>
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-base text-slate-600">
          관심종목을 등록하면 AI가 방향·진입가·목표가·보유기간을
          한 장의 의사결정 카드로 정리합니다.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="w-full rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            로그인
          </Link>
        </div>
        <p className="mt-3 text-xs text-slate-400">Google 계정 1초 연결 · 카드 발급까지 2분</p>
      </section>

      {/* Sample cards */}
      <section className="mx-auto max-w-3xl px-4 pb-12">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-slate-400">
          오늘의 의사결정 카드 예시
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {SAMPLE_CARDS.map((card) => (
            <SampleCard key={card.ticker} card={card} />
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">
          * 실제 추천이 아닙니다. 투자 판단의 참고 자료이며 투자 자문이 아닙니다.
        </p>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="text-center text-xl font-semibold">
            리서치 45분을 아침 3분으로
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="mx-auto max-w-3xl px-4 py-14 text-center">
        <h2 className="text-xl font-semibold">지금 내 관심종목으로 확인하기</h2>
        <p className="mt-2 text-sm text-slate-600">
          TSLA, NVDA, AAPL 등 최대 3종목을 등록하면 매일 아침 카드가 발급됩니다.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          무료로 시작하기
        </Link>
      </section>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        투자 참고용 정보이며 투자 자문이 아닙니다. 이 서비스는 브로커 주문 실행을 제공하지 않습니다.
      </footer>
    </main>
  );
}
