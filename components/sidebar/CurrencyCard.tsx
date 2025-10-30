// components/sidebar/CurrencyCard.tsx
"use client";

import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { KeyboardEvent } from "react";

/**
 * Displays a single currency conversion card with amount, rate, and metadata.
 */
type Props = {
  /** ISO currency code (e.g. USD) */
  code: string;
  /** Optional emoji/icon representing the currency */
  flag?: string;
  /** Human-readable currency name */
  label?: string;
  /** Converted amount from AUD, null when unavailable */
  amount: number | null;
  /** AUD → target currency rate, null when unavailable */
  rate: number | null;
  /** Optional className overrides */
  className?: string;
  /** Whether this card is currently selected */
  selected?: boolean;
  /** Handler invoked when the card is selected */
  onSelect?: () => void;
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

/**
 * Renders a currency card with flag, code, converted amount, and AUD rate.
 * Amount scrolls horizontally if it overflows.
 */
export function CurrencyCard({
  code,
  flag,
  label,
  amount,
  rate,
  className,
  selected = false,
  onSelect,
}: Props) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!onSelect) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect();
      }
    },
    [onSelect]
  );

  const interactiveProps = onSelect
    ? {
        role: "button" as const,
        tabIndex: 0,
        onClick: onSelect,
        onKeyDown: handleKeyDown,
        "aria-pressed": selected,
        "aria-label": label ? `${code} – ${label}` : code,
      }
    : {};

  return (
    <Card
      className={cn(
        "h-full rounded-xl border py-4 transition-shadow",
        onSelect ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" : "",
        selected ? "border-primary bg-primary/5 shadow-lg" : "shadow-sm",
        !selected && onSelect ? "hover:shadow-md" : "",
        className
      )}
      {...interactiveProps}
    >
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
