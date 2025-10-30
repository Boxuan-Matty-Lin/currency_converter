// components/charts/HistoricalChart.tsx
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";

export type Point = { date: string; value: number };

type Props = {
  title?: string;                 // 左上角标题，例如 "USD / AUD"
  subtitle?: string;              // 右上角小字，例如 "Foreign Exchange Rate"
  data: Point[];                  // 形如 [{date:'2025-10-16', value:0.65}, ...]
  decimals?: number;              // tooltip 小数位，默认 4
  className?: string;             // 外层容器样式
};

export default function HistoricalChart({
  title,
  subtitle = "Foreign Exchange Rate",
  data,
  decimals = 4,
  className,
}: Props) {
  // 最后一个点，用于高亮当前值
  const lastPoint = useMemo(() => (data && data.length ? data[data.length - 1] : null), [data]);

  const { domain, ticks } = useMemo(() => {
    if (!data?.length) return { domain: undefined, ticks: [] as number[] };

    const values = data.map((p) => p.value).filter((v) => Number.isFinite(v));
    if (!values.length) return { domain: undefined, ticks: [] as number[] };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min;

    const padding = span === 0
      ? Math.max(Math.abs(max || min), 1) * 0.05
      : span * 0.1;

    const lower = min - padding;
    const upper = max + padding;
    const steps = 4;
    const ticks: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const v = lower + ((upper - lower) * i) / steps;
      ticks.push(v);
    }

    return {
      domain: [lower, upper] as [number, number],
      ticks,
    };
  }, [data]);

  const yAxisDomain = domain ?? (["auto", "auto"] as ["auto", "auto"]);
  const yAxisTicks = ticks.length ? ticks : undefined;

  return (
    <div className={`rounded-xl border p-6 ${className ?? ""}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-base font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fxFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopOpacity={0.2} />
                <stop offset="95%" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* 时间轴隐藏刻度线，用 CSS 留白来还原你给的简洁风 */}
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              minTickGap={40}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={yAxisDomain}
              ticks={yAxisTicks}
              tickLine={false}
              axisLine={false}
              width={60}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => Number(v).toFixed(decimals)}
            />

            <Tooltip
              labelFormatter={(d) => d as string}
              formatter={(v: any) => Number(v).toFixed(decimals)}
            />

            <Area
              type="monotone"
              dataKey="value"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4 }}
              fill="url(#fxFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 末端小圆点效果，和 Recharts activeDot 搭配，保证始终有个终点标记 */}
      {lastPoint ? (
        <div className="mt-2 text-right text-sm text-muted-foreground">
          {lastPoint.date} · {lastPoint.value.toFixed(decimals)}
        </div>
      ) : null}
    </div>
  );
}
