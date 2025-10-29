// components/sidebar/CurrencySidebar.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Skeleton } from "@/components/ui";
import { CurrencyCard } from "./CurrencyCard";
import { CurrencyAmountInput } from "./CurrencyAmountInput";

type Rates = Record<string, number>;
const TARGETS = ["USD", "EUR", "JPY", "GBP", "CNY"] as const;

const META: Record<string, { flag: string; label: string }> = {
  USD: { flag: "🇺🇸", label: "United States Dollar" },
  EUR: { flag: "🇪🇺", label: "Euro" },
  JPY: { flag: "🇯🇵", label: "Japanese Yen" },
  GBP: { flag: "🇬🇧", label: "British Pound" },
  CNY: { flag: "🇨🇳", label: "Chinese Yuan" },
};

/**
 * Sidebar panel showing AUD amount input and a stack of converted currency cards.
 * Handles fetching latest rates and manages loading/error state.
 */
export function CurrencySidebar() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await fetch("/api/rates/latest", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      setRates(data?.rates ?? null);
    } catch (error) {
    // set error message
    setErr("Failed to load rates");

  } finally {
    setLoading(false);
  }
};

  const amt = Number(amount) || 0;

  return (
    <aside className="flex h-full flex-col gap-3">
      <Card className="rounded-xl border shadow-sm py-4">
        <CardContent className="px-4">
          <CurrencyAmountInput
            amount={amount}
            loading={loading}
            onAmountChange={setAmount}
            onRefresh={refresh}
          />
        </CardContent>
      </Card>
      {err && (
        <div
          role="alert"
          aria-live="assertive"
          data-testid="error-box"
          className="text-sm text-red-600"
        >
          {err}
        </div>
      )}

      <div className="flex-1">
        {loading ? (
          <div className="flex h-full flex-col gap-2">
            {Array.from({ length: TARGETS.length }).map((_, i) => (
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
            {TARGETS.map((code) => {
              const rate = rates?.[code] ?? null;
              const meta = META[code];
              return (
                <div key={code} className="flex-1">
                  <CurrencyCard
                    code={code}
                    flag={meta?.flag}
                    label={meta?.label}
                    rate={rate}
                    amount={rate == null ? null : amt * rate}
                    className="h-full"
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
