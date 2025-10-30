// components/sidebar/CurrencySidebar.tsx
"use client";

import { Card, CardContent, Skeleton } from "@/components/ui";
import { CurrencyCard } from "./CurrencyCard";
import { CurrencyAmountInput } from "./CurrencyAmountInput";

export type Rates = Record<string, number>;
export const TARGET_CODES = ["USD", "EUR", "JPY", "GBP", "CNY"] as const;
export type TargetCode = typeof TARGET_CODES[number];

export const CURRENCY_META: Record<TargetCode, { flag: string; label: string }> = {
  USD: { flag: "🇺🇸", label: "United States Dollar" },
  EUR: { flag: "🇪🇺", label: "Euro" },
  JPY: { flag: "🇯🇵", label: "Japanese Yen" },
  GBP: { flag: "🇬🇧", label: "British Pound" },
  CNY: { flag: "🇨🇳", label: "Chinese Yuan" },
};

/**
 * Sidebar panel showing AUD amount input and a stack of converted currency cards.
 * Receives data and event handlers from parent.
 */
export type CurrencySidebarProps = {
  amount: string;
  rates: Rates | null;
  loading: boolean;
  error: string;
  selectedCode: TargetCode;
  onAmountChange: (value: string) => void;
  onRefresh: () => void;
  onSelectCurrency: (code: TargetCode) => void;
};

export function CurrencySidebar({
  amount,
  rates,
  loading,
  error,
  selectedCode,
  onAmountChange,
  onRefresh,
  onSelectCurrency,
}: CurrencySidebarProps) {
  const amt = Number(amount) || 0;

  return (
    <aside className="flex h-full flex-col gap-3">
      <Card className="rounded-xl border shadow-sm py-4">
        <CardContent className="px-4">
          <CurrencyAmountInput
            amount={amount}
            loading={loading}
            onAmountChange={onAmountChange}
            onRefresh={onRefresh}
          />
        </CardContent>
      </Card>
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          data-testid="error-box"
          className="text-sm text-red-600"
        >
          {error}
        </div>
      )}

      <div className="flex-1">
        {loading ? (
          <div className="flex h-full flex-col gap-2">
            {Array.from({ length: TARGET_CODES.length }).map((_, i) => (
              <div
                key={i}
                role="status"
                aria-label="Loading currency card"
                data-testid="skeleton"
              >
                <Skeleton className="flex-1 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col gap-2">
            {TARGET_CODES.map((code) => {
              const rate = rates?.[code] ?? null;
              const meta = CURRENCY_META[code];
              return (
                <div key={code} className="flex-1">
                  <CurrencyCard
                    code={code}
                    flag={meta?.flag}
                    label={meta?.label}
                    rate={rate}
                    amount={rate == null ? null : amt * rate}
                    className="h-full"
                    selected={selectedCode === code}
                    onSelect={() => onSelectCurrency(code)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
