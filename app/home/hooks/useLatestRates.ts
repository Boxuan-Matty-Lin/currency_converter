"use client";

import { useCallback, useState } from "react";
import type { Rates } from "@/components/sidebar/CurrencySidebar";

type LatestResponse = {
  rates?: Rates;
  timestamp?: number;
  base?: string;
  error?: string;
};

/**
 * Fetches and caches the latest rates from the `/api/rates/latest` endpoint.
 * Handles loading and error states for convenient consumption in components.
 */
export function useLatestRates() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/rates/latest", { cache: "no-store" });
      const data: LatestResponse = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      setRates(data?.rates ?? null);
    } catch (e: unknown) {
      console.error("[rates/latest] fetch failed:", e);
      setError("Failed to load rates. Please try again.");
      setRates(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rates,
    loading,
    error,
    refresh,
  };
}
