// components/sidebar/CurrencyCard.tsx
"use client";

import { Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

type Props = {
  code: string;
  flag?: string;
  label?: string;
  amount: number | null;
  rate: number | null;
  className?: string;
};

const fmtAmt = (value: number, code: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(value);

const fmtRate = (n: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 4,
  }).format(n);

export function CurrencyCard({
  code,
  flag,
  label,
  amount,
  rate,
  className,
}: Props) {
  return (
    <Card className={cn("h-full rounded-xl border shadow-sm py-4", className)}>
      <CardContent className="flex h-full flex-col justify-between space-y-3 px-4 py-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">{flag ?? "💱"}</span>
            <div className="flex flex-col">
              <span className="text-base font-semibold">{code}</span>
              {label && (
                <span className="text-xs text-muted-foreground">{label}</span>
              )}
            </div>
          </div>
          <div className="max-w-[220px] overflow-x-auto">
            <div className="text-xl font-semibold tabular-nums" style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {amount == null ? "—" : fmtAmt(amount, code)}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground uppercase">
          1 AUD = {rate == null ? "—" : fmtRate(rate)} {code}
        </div>
      </CardContent>
    </Card>
  );
}
