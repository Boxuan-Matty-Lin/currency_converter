'use client';

// app/home/page.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import ChartWithInfo from "@/components/charts/ChartWithInfo";
import {
  CurrencySidebar,
  TARGET_CODES,
  CURRENCY_META,
  type TargetCode,
} from "@/components/sidebar/CurrencySidebar";
import { Button } from "@/components/ui";
import { useLatestRates } from "./hooks/useLatestRates";
import { useResponsiveDesktop } from "./hooks/useResponsiveDesktop";
import { useChartModal } from "./hooks/useChartModal";
import { useHistorySeries } from "./hooks/useHistorySeries";

const HISTORY_DAYS = 14;
// Optional: add a fallback to be extra safe when TARGET_CODES might be empty
const DEFAULT_CODE = (TARGET_CODES[0] ?? "USD") as TargetCode;

export default function Home() {
  // Latest rates (loading/error/refresh handled by the hook)
  const {
    rates,
    loading: loadingRates,
    error: ratesError,
    refresh: refreshRates,
  } = useLatestRates();

  // User-entered amount
  const [amount, setAmount] = useState("");

  // Selected currency for chart/preview
  const [selectedCode, setSelectedCode] = useState<TargetCode>(DEFAULT_CODE);

  // Responsive breakpoint
  const isDesktop = useResponsiveDesktop();

  // Modal control (Escape + body scroll lock are handled inside the hook)
  const { isChartModalOpen, openModal, closeModal } = useChartModal();

  useEffect(() => {
    if (isDesktop) closeModal();
  }, [closeModal, isDesktop]);

  // Historical series (last 13 days)
  const {
    historySeries,
    loading: loadingHistory,
    error: historyError,
    refresh: refreshHistory,
  } = useHistorySeries(HISTORY_DAYS, TARGET_CODES);

  // Select a currency; on mobile, also open the chart modal
  const handleSelectCurrency = useCallback(
    (code: TargetCode) => {
      setSelectedCode(code);
      if (!isDesktop) openModal();
    },
    [isDesktop, openModal]
  );

  // Initial fetch: latest + history
  useEffect(() => {
    refreshRates();
    refreshHistory();
  }, [refreshRates, refreshHistory]);

  // Active series/meta for the chart
  const activeSeries = useMemo(
    () => historySeries[selectedCode] ?? [],
    [historySeries, selectedCode]
  );
  const activeMeta = useMemo(() => CURRENCY_META[selectedCode], [selectedCode]);
  const chartTitle = useMemo(() => `${selectedCode} / AUD`, [selectedCode]);

  // Chart content: render by loading/error/data states
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

    return <div className="w-full">{inner}</div>;
  }, [activeSeries, activeMeta?.label, chartTitle, historyError, isDesktop, loadingHistory]);

  // NOTE: Removed page-level Escape listener and body scroll lock.
  // These are implemented inside useChartModal to avoid duplicate effects.

  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full">
        {/* Left panel: amount input, targets list, refresh */}
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

        {/* Right panel: chart area (desktop only) */}
        <div className="hidden flex-1 flex-col gap-4 px-6 lg:px-8 py-6 lg:flex">
          {chartContent}
        </div>
      </div>

      {/* Mobile chart modal */}
      {isChartModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
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
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={closeModal}
                aria-label="Close chart"
              >
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
