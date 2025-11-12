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
  title?: string;                 // title, such as "EUR to USD Exchange Rate"
  subtitle?: string;              // subtitle, such as "Foreign Exchange Rate"
  data: Point[];                  // data points, e.g., [{date:'2025-10-16', value:0.65}, ...]
  decimals?: number;              // number of decimal places in tooltip, default 4
  className?: string;             // outer container styles
};

export default function HistoricalChart({
  title,
  subtitle = "Foreign Exchange Rate",
  data,
  decimals = 4,
  className,
}: Props) {
  // Last data point, used to highlight the current value
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
            {/* Keep the time axis simple, do not change the default colors */}
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

            {/* Only adjust Tooltip size and border radius
                In dark mode, use gray background and gray-white text, keep others native */}
            <Tooltip
              contentStyle={{
                ...(isDark
                  ? {
                      background: "hsl(var(--muted))",           // gray background
                      color: "hsl(var(--muted-foreground))",     // gray-white text
                    }
                  : {}),
                padding: "6px 8px",                              // smaller
                borderRadius: "10px",                            // rounded corners
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


            <defs>
              <linearGradient id="fxFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopOpacity={0.2} />
                <stop offset="95%" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Text tooltip for the last data point */}
      {lastPoint ? (
        <div className="mt-2 text-right text-sm text-muted-foreground">
          {lastPoint.date} · {lastPoint.value.toFixed(decimals)}
        </div>
      ) : null}
    </div>
  );
}
