// components/sidebar/CurrencySidebar.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Input, Button, Skeleton } from "@/components/ui";
import { CurrencyCard } from "./CurrencyCard";
import { RefreshCw } from "lucide-react";

type Rates = Record<string, number>;
const TARGETS = ["USD", "EUR", "JPY", "GBP", "CNY"] as const;

const META: Record<string, { flag: string; label: string }> = {
  USD: { flag: "🇺🇸", label: "United States Dollar" },
  EUR: { flag: "🇪🇺", label: "Euro" },
  JPY: { flag: "🇯🇵", label: "Japanese Yen" },
  GBP: { flag: "🇬🇧", label: "British Pound" },
  CNY: { flag: "🇨🇳", label: "Chinese Yuan" },
};

export function CurrencySidebar() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [amount, setAmount] = useState("100");
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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load rates";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  const amt = Number(amount) || 0;

  return (
    <aside className="flex h-full flex-col gap-3">
      <Card className="rounded-xl border shadow-sm py-4">
        <CardContent className="px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium uppercase">
              <span className="text-2xl leading-none">🇦🇺</span>
              <span>AUD</span>
              {/* <ChevronDown className="h-4 w-4 text-muted-foreground" /> */}
            </div>

            <div className="flex-1 pl-1">
              <Input
                id="aud-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                className="w-full border-0 bg-transparent text-left text-lg font-semibold shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={refresh}
              className="shrink-0"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin text-primary" : ""
                }`}
                aria-hidden
              />
              <span className="sr-only">Refresh rates</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      {err && <span className="text-sm text-red-600">{err}</span>}

      <div className="flex-1">
        {loading ? (
          <div className="flex h-full flex-col gap-2">
            {Array.from({ length: TARGETS.length }).map((_, i) => (
              <Skeleton key={i} className="flex-1 rounded-xl" />
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
