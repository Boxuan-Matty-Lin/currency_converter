'use client';

// app/page.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import ChartWithInfo from "@/components/charts/ChartWithInfo";
import type { Point } from "@/components/charts/HistoricalChart";
import {
  CurrencySidebar,
  type Rates,
  TARGET_CODES,
  CURRENCY_META,
  type TargetCode,
} from "@/components/sidebar/CurrencySidebar";
import { Button } from "@/components/ui";

type LatestResponse = {
  rates?: Rates;
  timestamp?: number;
  base?: string;
  error?: string;
};

type HistoryResponse = {
  base: string;
  startDate: string;
  endDate: string;
  series?: Record<string, Point[]>;
  error?: string;
};

const HISTORY_DAYS = 13;
const DEFAULT_CODE = TARGET_CODES[0];

export default function Home() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [amount, setAmount] = useState("");
  const [loadingRates, setLoadingRates] = useState(true);
  const [ratesError, setRatesError] = useState("");

  const [selectedCode, setSelectedCode] = useState<TargetCode>(DEFAULT_CODE);
  const [historySeries, setHistorySeries] = useState<Partial<Record<TargetCode, Point[]>>>({});
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [isChartModalOpen, setChartModalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false
  );

  const refreshRates = useCallback(async () => {
    try {
      setLoadingRates(true);
      setRatesError("");
      const res = await fetch("/api/rates/latest", { cache: "no-store" });
      const data: LatestResponse = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      setRates(data?.rates ?? null);
    } catch (e: unknown) {
      console.error("[rates/latest] fetch failed:", e);
      setRatesError("Failed to load rates. Please try again.");
      setRates(null);
    } finally {
      setLoadingRates(false);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      setHistoryError("");
      const res = await fetch(`/api/rates/history?days=${HISTORY_DAYS}&orient=byCurrency`, {
        cache: "no-store",
      });
      const data: HistoryResponse = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);

      const seriesMap = data?.series ?? {};
      const normalized: Partial<Record<TargetCode, Point[]>> = {};

      for (const [code, series] of Object.entries(seriesMap)) {
        if (!Array.isArray(series)) continue;
        if ((TARGET_CODES as readonly string[]).includes(code)) {
          const filtered = series.filter(
            (pt): pt is Point =>
              pt &&
              typeof pt.date === "string" &&
              typeof pt.value === "number"
          );
          normalized[code as TargetCode] = filtered.slice(-HISTORY_DAYS);
        }
      }

      setHistorySeries(normalized);
    } catch (e: unknown) {
      console.error("[rates/history] fetch failed:", e);
      setHistoryError("Failed to load history. Please try again.");
      setHistorySeries({});
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const handleSelectCurrency = useCallback(
    (code: TargetCode) => {
      setSelectedCode(code);
      if (!isDesktop) {
        setChartModalOpen(true);
      }
    },
    [isDesktop]
  );

  const closeChartModal = useCallback(() => setChartModalOpen(false), []);

  useEffect(() => {
    refreshRates();
    refreshHistory();
  }, [refreshRates, refreshHistory]);

  useEffect(() => {
    if (!isChartModalOpen) return;
    if (typeof window === "undefined") return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setChartModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isChartModalOpen]);

  const activeSeries = useMemo(
    () => historySeries[selectedCode] ?? [],
    [historySeries, selectedCode]
  );
  const activeMeta = useMemo(() => CURRENCY_META[selectedCode], [selectedCode]);
  const chartTitle = useMemo(() => `${selectedCode} / AUD`, [selectedCode]);

  const chartContent = useMemo(() => {
    let inner: ReactNode;

    if (loadingHistory) {
      inner = (
        <div className="rounded-xl border p-6 text-sm text-muted-foreground">
          Loading history…
        </div>
      );
    } else if (historyError) {
      inner = (
        <div className="rounded-xl border p-6 text-sm text-destructive">
          {historyError}
        </div>
      );
    } else if (!activeSeries.length) {
      inner = (
        <div className="rounded-xl border p-6 text-sm text-muted-foreground">
          No historical data available yet.
        </div>
      );
    } else {
      inner = (
        <ChartWithInfo
          title={chartTitle}
          subtitle={activeMeta?.label}
          data={activeSeries}
          infoDefaultOpen={isDesktop}
          className="w-full"
        />
      );
    }

    const wrapperClass = "w-full";
    return <div className={wrapperClass}>{inner}</div>;
  }, [activeSeries, activeMeta?.label, chartTitle, historyError, isDesktop, loadingHistory]);

  useEffect(() => {
    if (!isChartModalOpen) return;
    if (typeof document === "undefined") return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isChartModalOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = (matches: boolean) => {
      setIsDesktop(matches);
      if (matches) setChartModalOpen(false);
    };

    update(mq.matches);

    const listener = (event: MediaQueryListEvent) => update(event.matches);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
    mq.addListener(listener);
    return () => mq.removeListener(listener);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full">
        <section className="flex min-h-screen w-full flex-col gap-5 px-4 py-6 sm:px-6 lg:w-1/3 lg:px-8 xl:px-10">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold">CURRENCY CONVERTER</h1>
          </header>

          <CurrencySidebar
            amount={amount}
            rates={rates}
            loading={loadingRates}
            error={ratesError}
            selectedCode={isDesktop || isChartModalOpen ? selectedCode : null}
            onAmountChange={setAmount}
            onRefresh={refreshRates}
            onSelectCurrency={handleSelectCurrency}
          />
        </section>

        <div className="hidden flex-1 flex-col gap-4 px-6 lg:px-8 py-6 lg:flex">
          {chartContent}
        </div>
      </div>

      {isChartModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeChartModal} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${chartTitle} history`}
            className="relative z-10 w-full max-w-xl rounded-2xl border bg-background shadow-xl"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h2 className="text-lg font-semibold">{chartTitle}</h2>
                {activeMeta?.label ? (
                  <p className="text-sm text-muted-foreground">{activeMeta.label}</p>
                ) : null}
              </div>
              <Button variant="ghost" size="icon-sm" onClick={closeChartModal} aria-label="Close chart">
                ✕
              </Button>
            </div>
            <div className={isDesktop ? "p-4" : "p-0"}>{chartContent}</div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
