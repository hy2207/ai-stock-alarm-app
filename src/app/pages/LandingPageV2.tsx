import { useEffect } from 'react';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Gauge,
  LineChart,
  LockKeyhole,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { StockAlarmBrand } from '../components/StockAlarmBrand';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { ROUTES } from '../routes';

interface LandingPageV2Props {
  onNavigate: (route: string) => void;
}

const proofMetrics = [
  { value: '3분', label: '아침 판단 시간' },
  { value: '1장', label: '종목별 액션 카드' },
  { value: '0개', label: '초보자에게 필요한 차트 해석' },
  { value: '3단계', label: '관심종목 입력부터 알림까지' },
];

const authoritySignals = ['NASDAQ', 'SEC EDGAR', 'FRED', 'Earnings', 'Market News'];

const benefitCards = [
  {
    icon: Target,
    title: '매수 여부보다 먼저 행동을 정합니다',
    body: 'BUY/SELL, 진입가, 목표가, 손절가, 보유 기간을 한 번에 보여줘 고민 시간을 줄입니다.',
  },
  {
    icon: ShieldCheck,
    title: '내 성향에 맞는 리스크로 바꿉니다',
    body: '안정형, 중립형, 공격형 기준에 따라 같은 종목도 다른 진입 범위와 손절선을 제안합니다.',
  },
  {
    icon: BellRing,
    title: '장이 열리기 전 놓치지 않게 보냅니다',
    body: '매일 확인해야 하는 관심종목을 아침 브리핑 형태로 정리해 반복 체크 부담을 낮춥니다.',
  },
];

const outcomes = [
  {
    ticker: 'NVDA',
    action: '계획 매수',
    tone: 'BUY',
    entry: '$820-835',
    target: '$875-895',
    hold: '5일',
    reason: '데이터센터 수요와 거래량 회복으로 단기 추세 유지 가능성',
  },
  {
    ticker: 'AAPL',
    action: '분할 진입',
    tone: 'BUY',
    entry: '$168.40',
    target: '$176.00',
    hold: '4일',
    reason: '자사주 매입과 방어적 수급이 하방을 제한하는 구간',
  },
  {
    ticker: 'TSLA',
    action: '반등 시 매도',
    tone: 'SELL',
    entry: '$151-154',
    target: '$141-145',
    hold: '3일',
    reason: '단기 반등 이후 거래량 약화로 되돌림 가능성 확대',
  },
];

const roiRows = [
  { label: '직접 리서치', time: '45-90분', cost: '뉴스, 실적, 가격대 수동 확인', width: '92%' },
  { label: 'AI Stock Alarm', time: '3분', cost: '관심종목별 액션 카드 확인', width: '18%' },
];

export function LandingPageV2({ onNavigate }: LandingPageV2Props) {
  const { setIsLoggedIn, addDebugEvent } = useApp();

  useEffect(() => {
    addDebugEvent('landing_view');
  }, []);

  const startDemo = (source: string) => {
    addDebugEvent('landing_cta_click', { source });
    setIsLoggedIn(true);
    onNavigate(ROUTES.home);
  };

  const goToLogin = () => {
    addDebugEvent('landing_login_click');
    onNavigate(ROUTES.login);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-[#f7f8f5]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => scrollTo('hero')}
            className="flex items-center gap-3"
            aria-label="StockAlarm 홈으로 이동"
          >
            <StockAlarmBrand variant="header" />
            <span className="text-base font-semibold tracking-normal text-slate-950">StockAlarm</span>
          </button>

          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <button type="button" onClick={() => scrollTo('proof')} className="hover:text-slate-950">
              신뢰 근거
            </button>
            <button type="button" onClick={() => scrollTo('process')} className="hover:text-slate-950">
              작동 방식
            </button>
            <button type="button" onClick={() => scrollTo('outcomes')} className="hover:text-slate-950">
              결과 예시
            </button>
            <button type="button" onClick={() => scrollTo('roi')} className="hover:text-slate-950">
              효율 비교
            </button>
          </nav>

          <Button
            onClick={() => startDemo('top_nav')}
            className="h-10 rounded-lg bg-slate-950 px-4 text-white hover:bg-slate-800"
          >
            오늘 카드 보기
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </header>

      <section id="hero" className="overflow-hidden border-b border-slate-200 bg-[#f7f8f5]">
        <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-[0.95fr_1.05fr] md:px-6 md:py-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              <Sparkles className="size-4" />
              차트보다 먼저, 오늘 할 행동을 받으세요
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-slate-950 md:text-6xl">
              미국주식 판단을 아침 3분 안에 끝내세요
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              관심종목을 입력하면 AI가 방향, 가격대, 보유 기간, 근거를 한 장의 의사결정 카드로 정리합니다. 장 시작 전 무엇을 볼지부터 정해집니다.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => startDemo('hero_primary')}
                className="h-12 rounded-lg bg-blue-600 px-6 text-base text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              >
                무료 데모로 시작하기
                <ChevronRight className="size-5" />
              </Button>
              <Button
                onClick={goToLogin}
                variant="outline"
                className="h-12 rounded-lg border-slate-300 bg-white px-6 text-base text-slate-900 hover:bg-slate-50"
              >
                로그인하고 설정하기
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                투자 참고용 리서치
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                관심종목 3개부터 시작
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                브라우저 저장 데모 제공
              </span>
            </div>
          </div>

          <HeroProductPreview />
        </div>
      </section>

      <section id="proof" className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
                Social Proof & Authority
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">
                개인투자자의 매일 반복되는 판단을 숫자로 줄입니다
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {proofMetrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-slate-200 bg-[#f7f8f5] p-4">
                  <div className="text-2xl font-semibold text-slate-950">{metric.value}</div>
                  <div className="mt-1 text-sm text-slate-600">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-5">
            {authoritySignals.map((signal) => (
              <div
                key={signal}
                className="flex min-h-16 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500"
              >
                {signal}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            위 항목은 제품이 참고하도록 설계된 시장 데이터와 검토 프레임워크 예시입니다.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#f7f8f5]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
              Value Proposition
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
              기능이 아니라, 매일의 투자 결정을 더 가볍게 만듭니다
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {benefitCards.map(({ icon: Icon, title, body }) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-slate-950 text-white">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-xl font-semibold leading-snug text-slate-950">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
                Input-Output Diagram
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
                종목을 넣으면, 오늘의 행동 카드가 나옵니다
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                복잡한 뉴스, 가격대, 실적 이벤트, 리스크 기준은 내부에서 처리하고 사용자는 결과만 확인합니다.
              </p>
              <Button
                onClick={() => startDemo('process_mid')}
                className="mt-7 h-12 rounded-lg bg-blue-600 px-6 text-white hover:bg-blue-700"
              >
                내 관심종목으로 확인하기
                <ArrowRight className="size-4" />
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
              <ProcessStep icon={WalletCards} title="관심종목 입력" body="AAPL, TSLA, NVDA 또는 섹터 선택" />
              <FlowArrow />
              <ProcessStep icon={BrainCircuit} title="AI 판단 엔진" body="가격대, 이벤트, 리스크 성향을 함께 정리" emphasis />
              <FlowArrow />
              <ProcessStep icon={Newspaper} title="의사결정 카드" body="방향, 진입가, 목표가, 손절가, 근거 출력" />
            </div>
          </div>
        </div>
      </section>

      <section id="outcomes" className="border-b border-slate-200 bg-[#111827] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Outcome Showcase
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
                사용자는 이런 결과물을 기대합니다
              </h2>
              <p className="mt-4 leading-7 text-slate-300">
                자동화된 추천이라도 결과는 즉시 실행 가능한 형태여야 합니다. 각 카드는 판단에 필요한 핵심만 남깁니다.
              </p>
            </div>
            <Button
              onClick={() => startDemo('outcome_gallery')}
              className="h-12 rounded-lg bg-white px-6 text-slate-950 hover:bg-slate-100"
            >
              실제 홈으로 이동
              <ArrowRight className="size-4" />
            </Button>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {outcomes.map((item) => (
              <article key={item.ticker} className="rounded-lg border border-white/10 bg-white p-5 text-slate-950 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-500">{item.action}</div>
                    <h3 className="text-2xl font-semibold">{item.ticker}</h3>
                  </div>
                  <span className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                    item.tone === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {item.tone}
                  </span>
                </div>
                <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500">진입</dt>
                    <dd className="mt-1 font-semibold">{item.entry}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">목표</dt>
                    <dd className="mt-1 font-semibold">{item.target}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">보유</dt>
                    <dd className="mt-1 font-semibold">{item.hold}</dd>
                  </div>
                </dl>
                <p className="mt-5 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600">
                  {item.reason}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="roi" className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[0.9fr_1.1fr] md:items-center md:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
              Efficiency Graph
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 md:text-4xl">
              매일 1시간 리서치를 3분 점검으로 압축합니다
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              AI Stock Alarm의 가치는 종목을 맞히는 약속이 아니라, 매일 반복되는 의사결정 준비 비용을 줄이는 데 있습니다.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-[#f7f8f5] p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="size-5 text-blue-700" />
                <span className="font-semibold text-slate-950">아침 리서치 소요 시간</span>
              </div>
              <span className="text-sm text-slate-500">체감 비교</span>
            </div>
            <div className="space-y-6">
              {roiRows.map((row) => (
                <div key={row.label}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="font-semibold text-slate-800">{row.label}</span>
                    <span className="text-slate-500">{row.time}</span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-lg bg-slate-200">
                    <div
                      className={`h-full rounded-lg ${row.label === 'AI Stock Alarm' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: row.width }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{row.cost}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8f5]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="grid gap-8 rounded-lg border border-slate-200 bg-slate-950 p-8 text-white md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Start Now
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
                오늘 장 전에 볼 종목 3개만 고르세요
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                CTA를 누르면 현재 구현된 서비스 홈으로 이동해 의사결정 카드 흐름을 바로 확인할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Button
                onClick={() => startDemo('final_primary')}
                className="h-12 rounded-lg bg-blue-600 px-6 text-white hover:bg-blue-700"
              >
                지금 카드 확인하기
                <ArrowRight className="size-4" />
              </Button>
              <Button
                onClick={goToLogin}
                variant="outline"
                className="h-12 rounded-lg border-white/20 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
              >
                계정으로 시작하기
              </Button>
            </div>
          </div>

          <footer className="flex flex-col gap-4 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <LockKeyhole className="size-4" />
              프로토타입에서는 로그인 상태와 설정이 이 브라우저에 임시 저장됩니다.
            </div>
            <div>투자 참고용 정보이며 투자 자문이 아닙니다.</div>
          </footer>
        </div>
      </section>
    </main>
  );
}

function HeroProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="rounded-lg border border-slate-300 bg-slate-950 p-3 shadow-2xl shadow-slate-900/20">
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-xs text-slate-400">Morning Decision Deck</div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_0.8fr]">
          <div className="rounded-lg bg-white p-5">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-slate-500">오늘의 의사결정 카드</div>
                <div className="mt-1 text-3xl font-semibold text-slate-950">NVDA</div>
              </div>
              <span className="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                BUY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <PreviewMetric icon={Target} label="진입 범위" value="$820-835" />
              <PreviewMetric icon={TrendingUp} label="목표 범위" value="$875-895" />
              <PreviewMetric icon={Gauge} label="손절 기준" value="$792" />
              <PreviewMetric icon={CalendarClock} label="보유 기간" value="5일" />
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <BrainCircuit className="size-4 text-blue-600" />
                이유
              </div>
              <p className="text-sm leading-6 text-slate-600">
                데이터센터 수요와 최근 거래량 회복이 단기 추세 유지 가능성을 높입니다.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-lg bg-[#f8fafc] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Confidence Score</span>
                <Zap className="size-4 text-amber-500" />
              </div>
              <div className="space-y-2">
                <ConfidenceBar label="안정형" value="56%" tone="bg-emerald-500" />
                <ConfidenceBar label="중립형" value="78%" tone="bg-blue-600" />
                <ConfidenceBar label="공격형" value="64%" tone="bg-amber-500" />
              </div>
            </div>

            <div className="rounded-lg bg-blue-600 p-4 text-white">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <BellRing className="size-4" />
                오전 7:30 알림
              </div>
              <p className="text-sm leading-6 text-blue-50">
                NVDA는 계획 매수, TSLA는 반등 시 매도 후보입니다.
              </p>
            </div>

            <div className="rounded-lg bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <LineChart className="size-4 text-slate-700" />
                오늘 확인 항목
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <CheckLine text="실적 이벤트 없음" />
                <CheckLine text="거래량 회복 구간" />
                <CheckLine text="손절가 명확" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="text-base font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function ConfidenceBar({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-lg bg-slate-200">
        <div className={`h-full rounded-lg ${tone}`} style={{ width: value }} />
      </div>
    </div>
  );
}

function CheckLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="size-4 text-emerald-600" />
      <span>{text}</span>
    </div>
  );
}

function ProcessStep({
  icon: Icon,
  title,
  body,
  emphasis = false,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  emphasis?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-5 ${
      emphasis ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-[#f7f8f5]'
    }`}>
      <div className={`mb-4 flex size-11 items-center justify-center rounded-lg ${
        emphasis ? 'bg-blue-600 text-white' : 'bg-slate-950 text-white'
      }`}>
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center justify-center text-slate-400">
      <ArrowRight className="hidden size-6 md:block" />
      <ArrowRight className="size-6 rotate-90 md:hidden" />
    </div>
  );
}
