// src/lib/server/oxr_convert.ts
import "server-only";
import { getLatest } from "./oxr";

export type ConvertedItem = { code: string; rate: number | null; amount: number | null };
export type ConvertResult = { base: "AUD"; timestamp: number; amount: number; targets: ConvertedItem[] };
export const DEFAULTS_CURRENCY = ["USD", "EUR", "JPY", "GBP", "CNY"] as const;

// Calculate AUD -> target rate
export function rebaseToAUD(rates: Record<string, number>) {
  const out: Record<string, number> = {};
  const rAUD = rates.AUD;
  for (const k in rates) out[k] = rates[k] / rAUD; // 1 AUD -> k
  out.AUD = 1;
  return out;
}


// Get latest AUD exchange rates, optionally filtered by targets
export async function latestAudRates(targets?: string[]) {
  const { timestamp, rates } = await getLatest();
  const audRates = rebaseToAUD(rates);
  const list = (targets && targets.length
    ? Array.from(new Set(targets.map(t => t.toUpperCase().trim()).filter(Boolean)))
    : [...DEFAULTS_CURRENCY]
  );
  const filtered: Record<string, number> = {};
  for (const c of list) if (audRates[c] != null) filtered[c] = audRates[c];
  return { base: "AUD" as const, timestamp, rates: filtered };
}
