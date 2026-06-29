"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface PriceChartProps {
  ohlcv: PricePoint[];
  direction: "BUY" | "SELL";
  entryPrice?: number | null;
  targetPrice?: number | null;
  exitPrice?: number | null;
  height?: number;
}

function fmtPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

// y-axis domain that includes all reference lines
function computeDomain(
  ohlcv: PricePoint[],
  refs: (number | null | undefined)[],
): [number, number] {
  const values = [
    ...ohlcv.map((p) => p.high),
    ...ohlcv.map((p) => p.low),
    ...refs.filter((v): v is number => v != null),
  ];
  if (values.length === 0) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.08 || max * 0.05;
  return [
    Math.floor((min - pad) * 100) / 100,
    Math.ceil((max + pad) * 100) / 100,
  ];
}

function ChartTooltipContent({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as PricePoint | undefined;
  if (!d) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold text-slate-700">{label}</p>
      <p>종가 <span className="font-medium">{fmtPrice(d.close)}</span></p>
      <p className="text-slate-400">고가 {fmtPrice(d.high)} · 저가 {fmtPrice(d.low)}</p>
    </div>
  );
}

export function PriceChart({
  ohlcv,
  direction,
  entryPrice,
  targetPrice,
  exitPrice,
  height = 160,
}: PriceChartProps) {
  if (ohlcv.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-slate-400"
        style={{ height }}
      >
        가격 데이터 없음
      </div>
    );
  }

  const isBuy = direction === "BUY";
  const fillColor = isBuy ? "#10b981" : "#f43f5e"; // emerald-500 / rose-500
  const domain = computeDomain(ohlcv, [entryPrice, targetPrice, exitPrice]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={ohlcv} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${direction}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fillColor} stopOpacity={0.18} />
            <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={domain}
          hide
        />
        <Tooltip content={<ChartTooltipContent />} />

        {/* Reference lines — only if price is defined */}
        {targetPrice != null && (
          <ReferenceLine
            y={targetPrice}
            stroke={isBuy ? "#10b981" : "#f43f5e"}
            strokeDasharray="4 3"
            label={{
              value: `목표 ${fmtPrice(targetPrice)}`,
              position: "insideTopRight",
              fontSize: 9,
              fill: isBuy ? "#059669" : "#e11d48",
            }}
          />
        )}
        {exitPrice != null && (
          <ReferenceLine
            y={exitPrice}
            stroke="#f59e0b"
            strokeDasharray="4 3"
            label={{
              value: `손절 ${fmtPrice(exitPrice)}`,
              position: "insideBottomRight",
              fontSize: 9,
              fill: "#d97706",
            }}
          />
        )}
        {entryPrice != null && (
          <ReferenceLine
            y={entryPrice}
            stroke="#3b82f6"
            strokeDasharray="4 3"
            label={{
              value: `진입 ${fmtPrice(entryPrice)}`,
              position: "insideTopLeft",
              fontSize: 9,
              fill: "#2563eb",
            }}
          />
        )}

        <Area
          type="monotone"
          dataKey="close"
          stroke={fillColor}
          strokeWidth={2}
          fill={`url(#grad-${direction})`}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0, fill: fillColor }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
