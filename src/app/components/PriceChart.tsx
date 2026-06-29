"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  height?: number;
}

function fmtPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

function fmtYAxis(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function computeDomain(ohlcv: PricePoint[]): [number, number] {
  if (ohlcv.length === 0) return [0, 1];
  const lows = ohlcv.map((p) => p.low);
  const highs = ohlcv.map((p) => p.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const pad = (max - min) * 0.08 || max * 0.04;
  return [
    Math.floor((min - pad) * 100) / 100,
    Math.ceil((max + pad) * 100) / 100,
  ];
}

function ChartTooltipContent({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as PricePoint | undefined;
  if (!d) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold text-slate-700">{label}</p>
      <p>
        종가 <span className="font-medium">{fmtPrice(d.close)}</span>
      </p>
      <p className="text-slate-400">
        고가 {fmtPrice(d.high)} · 저가 {fmtPrice(d.low)}
      </p>
    </div>
  );
}

export function PriceChart({
  ohlcv,
  direction,
  height = 180,
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
  const strokeColor = isBuy ? "#10b981" : "#f43f5e";
  const gradientId = `price-grad-${direction}`;
  const domain = computeDomain(ohlcv);

  const tickInterval = Math.max(1, Math.floor(ohlcv.length / 6));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={ohlcv}
        margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.12} />
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e2e8f0"
          vertical={false}
        />

        <XAxis
          dataKey="date"
          interval={tickInterval}
          tick={{ fontSize: 9, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />

        <YAxis
          domain={domain}
          tickFormatter={fmtYAxis}
          tick={{ fontSize: 9, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          width={44}
          tickCount={5}
        />

        <Tooltip content={<ChartTooltipContent />} />

        <Area
          type="linear"
          dataKey="close"
          stroke={strokeColor}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0, fill: strokeColor }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
