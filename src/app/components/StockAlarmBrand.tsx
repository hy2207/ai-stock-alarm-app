import stockalarmLogo from '@/assets/brand/stockalarm-logo.png';
import stockalarmMark from '@/assets/brand/stockalarm-logo2.png';

type StockAlarmBrandProps = {
  /**
   * hero: 풀 로고(텍스트 포함) — 로그인 히어로 등
   * header: 글자 없는 마크 — 상단 네비, 파비콘과 동일 그래픽
   * mark: 마크 중간 크기 — 홈 등 카드 헤더
   * mark-lg: 마크 크게 — 온보딩 상단 등
   */
  variant?: 'hero' | 'header' | 'mark' | 'mark-lg';
  className?: string;
};

/** 투명 PNG 마크 — 배경색 위에서만 얇은 링으로 가독성 보조 */
const markFrame = 'shrink-0 rounded-lg object-contain ring-1 ring-slate-200/45 shadow-sm';

const variantDef: Record<
  NonNullable<StockAlarmBrandProps['variant']>,
  { src: string; className: string }
> = {
  hero: {
    src: stockalarmLogo.src,
    className: 'h-28 sm:h-32 w-auto max-w-full object-contain mx-auto',
  },
  header: {
    src: stockalarmMark.src,
    className: `h-9 w-9 p-0.5 ${markFrame}`,
  },
  mark: {
    src: stockalarmMark.src,
    className: `h-12 w-12 p-1 ${markFrame}`,
  },
  'mark-lg': {
    src: stockalarmMark.src,
    className: `h-16 w-16 p-1.5 ${markFrame}`,
  },
};

export function StockAlarmBrand({ variant = 'header', className = '' }: StockAlarmBrandProps) {
  const { src, className: base } = variantDef[variant];
  return (
    <img
      src={src}
      alt="StockAlarm"
      className={`${base} ${className}`.trim()}
      decoding="async"
    />
  );
}
