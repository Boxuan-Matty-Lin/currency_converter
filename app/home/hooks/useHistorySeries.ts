"use client";

import { useCallback, useMemo, useState } from "react";
import type { Point } from "@/components/charts/HistoricalChart";
import { TARGET_CODES, type TargetCode } from "@/components/sidebar/CurrencySidebar";

type HistoryResponse = {
  base: string;
  startDate: string;
  endDate: string;
  series?: Record<string, Point[]>;
  error?: string;
};

type HistorySeries = Partial<Record<TargetCode, Point[]>>;

/**
 * Fetches historical AUD-based exchange rate series for the requested currencies.
 * Normalises API output into chart-friendly point arrays and surfaces loading/error states.
 *
 * @param days - Number of historical days to request from the API.
 * @param targets - Currency codes to keep in the result set; defaults to the sidebar list.
 */
export function useHistorySeries(days: number, targets: readonly TargetCode[] = TARGET_CODES) {
  const [series, setSeries] = useState<HistorySeries>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalisedTargets = useMemo(
    () => targets.map((code) => code.toUpperCase() as TargetCode),
    [targets]
  );

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/rates/history?days=${days}&orient=byCurrency`, {
        cache: "no-store",
      });
      const data: HistoryResponse = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);

      const filtered: HistorySeries = {};
      const sliceCount = Math.max(days, 0);
      const targetSet = new Set(normalisedTargets);

      if (data.series) {
        for (const [code, list] of Object.entries(data.series)) {
          const upper = code.toUpperCase() as TargetCode;
          if (!targetSet.has(upper) || !Array.isArray(list)) continue;
          const validPoints = list.filter(
            (pt): pt is Point =>
              pt != null && typeof pt.date === "string" && typeof pt.value === "number"
          );
          filtered[upper] =
            sliceCount > 0 ? validPoints.slice(-sliceCount) : validPoints.slice();
        }
      }

      setSeries(filtered);
    } catch (e: unknown) {
      console.error("[rates/history] fetch failed:", e);
      setError("Failed to load history. Please try again.");
      setSeries({});
    } finally {
      setLoading(false);
    }
  }, [days, normalisedTargets]);

  return {
    historySeries: series,
    loading,
    error,
    refresh,
  };
}
