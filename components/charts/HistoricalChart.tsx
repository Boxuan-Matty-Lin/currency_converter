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
import { useTheme } from "next-themes";

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
  const lastPoint = useMemo(
    () => (data && data.length ? data[data.length - 1] : null),
    [data]
  );

  const { domain, ticks } = useMemo(() => {
    if (!data?.length) return { domain: undefined, ticks: [] as number[] };

    const values = data.map((p) => p.value).filter((v) => Number.isFinite(v));
    if (!values.length) return { domain: undefined, ticks: [] as number[] };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min;

    const padding =
      span === 0 ? Math.max(Math.abs(max || min), 1) * 0.05 : span * 0.1;

    const lower = min - padding;
    const upper = max + padding;
    const steps = 4;
    const t: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const v = lower + ((upper - lower) * i) / steps;
      t.push(v);
    }

    return {
      domain: [lower, upper] as [number, number],
      ticks: t,
    };
  }, [data]);

  const yAxisDomain = domain ?? (["auto", "auto"] as ["auto", "auto"]);
  const yAxisTicks = ticks.length ? ticks : undefined;

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className={`rounded-xl border p-6 ${className ?? ""}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-base font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer>
          <AreaChart data={data}>
            {/* 时间轴保持简洁，不改默认配色 */}
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

            {/* 只调整 Tooltip 尺寸与圆角
                暗黑模式下灰底和灰白字，其余保持原生 */}
            <Tooltip
              contentStyle={{
                ...(isDark
                  ? {
                      background: "hsl(var(--muted))",           // 灰底
                      color: "hsl(var(--muted-foreground))",     // 灰白字
                    }
                  : {}),
                padding: "6px 8px",                              // 更小
                borderRadius: "10px",                            // 圆角
              }}
              labelStyle={{ fontSize: 12, marginBottom: 2, lineHeight: 1.2 }}
              itemStyle={{ fontSize: 12, lineHeight: 1.2 }}
              labelFormatter={(d) => d as string}
              formatter={(value: number | string) =>
                Number(value).toFixed(decimals)
              }
            />

            <Area
              type="monotone"
              dataKey="value"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 4 }}
              fill="url(#fxFill)"
            />

            {/* 渐变不改颜色，仅保留透明度过渡 */}
            <defs>
              <linearGradient id="fxFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopOpacity={0.2} />
                <stop offset="95%" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 末端小圆点的文本提示 */}
      {lastPoint ? (
        <div className="mt-2 text-right text-sm text-muted-foreground">
          {lastPoint.date} · {lastPoint.value.toFixed(decimals)}
        </div>
      ) : null}
    </div>
  );
}
