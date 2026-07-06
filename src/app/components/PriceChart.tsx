"use client";

import {
  ComposedChart,
  Area,
  Line,
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

/** Statistical forecast overlay drawn past the last actual close. */
export interface ForecastOverlay {
  expectedPrice: number;
  lowBand: number;
  highBand: number;
  horizonDays: number;
}

interface ChartDatum {
  date: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  forecast?: number;
  band?: [number, number];
  /** 1-day-ahead backtest prediction for this (past) date. */
  predicted?: number;
}

/** Walk-forward backtest prediction for a displayed date. */
export interface BacktestOverlayPoint {
  date: string;
  predicted: number;
}

interface PriceChartProps {
  ohlcv: PricePoint[];
  direction: "BUY" | "SELL";
  height?: number;
  forecast?: ForecastOverlay | null;
  backtest?: BacktestOverlayPoint[] | null;
}

const FORECAST_COLOR = "#6366f1"; // indigo-500
const BACKTEST_COLOR = "#f59e0b"; // amber-500

function fmtPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

function fmtYAxis(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

/** Next `count` trading-day labels ("M/D", weekends skipped) after lastDate. */
function nextTradingDates(lastDate: string, count: number): string[] {
  const m = lastDate.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!m) {
    return Array.from({ length: count }, (_, i) => `+${i + 1}일`);
  }
  let d = new Date(new Date().getFullYear(), parseInt(m[1], 10) - 1, parseInt(m[2], 10));
  const out: string[] = [];
  while (out.length < count) {
    d = new Date(d.getTime() + 86_400_000);
    const day = d.getDay();
    if (day === 0 || day === 6) continue;
    out.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }
  return out;
}

/** Merge actual candles with backtest predictions and forecast points. */
function buildChartData(
  ohlcv: PricePoint[],
  forecast: ForecastOverlay | null | undefined,
  backtest: BacktestOverlayPoint[] | null | undefined,
): ChartDatum[] {
  const predictedByDate = new Map(
    (backtest ?? []).map((b) => [b.date, b.predicted]),
  );
  const data: ChartDatum[] = ohlcv.map((p) => ({
    ...p,
    predicted: predictedByDate.get(p.date),
  }));

  if (!forecast || ohlcv.length === 0) return data;

  const last = ohlcv[ohlcv.length - 1];
  const lastClose = last.close;
  const n = forecast.horizonDays;

  // Anchor the forecast series at the last actual close so lines connect
  data[data.length - 1] = {
    ...data[data.length - 1],
    forecast: lastClose,
    band: [lastClose, lastClose],
  };

  const futureDates = nextTradingDates(last.date, n);
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    data.push({
      date: futureDates[i - 1],
      forecast: lastClose + (forecast.expectedPrice - lastClose) * t,
      band: [
        lastClose + (forecast.lowBand - lastClose) * t,
        lastClose + (forecast.highBand - lastClose) * t,
      ],
    });
  }

  return data;
}

function computeDomain(data: ChartDatum[]): [number, number] {
  const values: number[] = [];
  for (const p of data) {
    if (p.low != null) values.push(p.low);
    if (p.high != null) values.push(p.high);
    if (p.forecast != null) values.push(p.forecast);
    if (p.predicted != null) values.push(p.predicted);
    if (p.band) values.push(p.band[0], p.band[1]);
  }
  if (values.length === 0) return [0, 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
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
  const d = payload[0]?.payload as ChartDatum | undefined;
  if (!d) return null;

  if (d.close != null) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
        <p className="mb-1 font-semibold text-slate-700">{label}</p>
        <p>
          종가 <span className="font-medium">{fmtPrice(d.close)}</span>
        </p>
        {d.high != null && d.low != null && (
          <p className="text-slate-400">
            고가 {fmtPrice(d.high)} · 저가 {fmtPrice(d.low)}
          </p>
        )}
        {d.predicted != null && (
          <p className="mt-0.5 text-amber-600">
            전일 예측 {fmtPrice(d.predicted)}
            <span className="ml-1 text-slate-400">
              (오차 {(Math.abs(d.predicted - d.close) / d.close * 100).toFixed(1)}%)
            </span>
          </p>
        )}
      </div>
    );
  }

  if (d.forecast != null) {
    return (
      <div className="rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs shadow-md">
        <p className="mb-1 font-semibold text-indigo-700">{label} (예상)</p>
        <p>
          예상가 <span className="font-medium">{fmtPrice(d.forecast)}</span>
        </p>
        {d.band && (
          <p className="text-slate-400">
            범위 {fmtPrice(d.band[0])} – {fmtPrice(d.band[1])}
          </p>
        )}
      </div>
    );
  }

  return null;
}

export function PriceChart({
  ohlcv,
  direction,
  height = 180,
  forecast,
  backtest,
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

  const data = buildChartData(ohlcv, forecast, backtest);
  const domain = computeDomain(data);
  const tickInterval = Math.max(1, Math.floor(data.length / 6));
  const hasForecast = forecast != null && data.length > ohlcv.length;
  const hasBacktest = data.some((p) => p.predicted != null);

  return (
    <div>
      {(hasForecast || hasBacktest) && (
        <div className="mb-1 flex items-center justify-end gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-0.5 w-4 rounded"
              style={{ backgroundColor: strokeColor }}
            />
            실제 종가
          </span>
          {hasBacktest && (
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: BACKTEST_COLOR }}
              />
              전일 예측
            </span>
          )}
          {hasForecast && (
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-0 w-4 border-t-2 border-dashed"
                style={{ borderColor: FORECAST_COLOR }}
              />
              수치 예상
            </span>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
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

          {/* ±1σ forecast band */}
          {hasForecast && (
            <Area
              type="linear"
              dataKey="band"
              stroke="none"
              fill={FORECAST_COLOR}
              fillOpacity={0.06}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          )}

          {/* Actual closes */}
          <Area
            type="linear"
            dataKey="close"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: strokeColor }}
          />

          {/* Walk-forward backtest predictions — dots on each past date;
              vertical distance to the actual line shows that day's error */}
          {hasBacktest && (
            <Line
              type="linear"
              dataKey="predicted"
              stroke="none"
              dot={{ r: 2.5, strokeWidth: 0, fill: BACKTEST_COLOR, fillOpacity: 0.85 }}
              activeDot={{ r: 4, strokeWidth: 0, fill: BACKTEST_COLOR }}
              isAnimationActive={false}
            />
          )}

          {/* Forecast line */}
          {hasForecast && (
            <Line
              type="linear"
              dataKey="forecast"
              stroke={FORECAST_COLOR}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: FORECAST_COLOR }}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
