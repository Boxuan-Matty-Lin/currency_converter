// src/lib/server/oxr_convert.ts
import "server-only";
import { getLatest } from "./oxr";

/**
 * Represents a single target currency conversion result.
 */
export type ConvertedItem = {
  code: string;
  rate: number | null;
  amount: number | null;
};

/**
 * Shape of the conversion payload returned to clients.
 */
export type ConvertResult = {
  base: "AUD";
  timestamp: number;
  amount: number;
  targets: ConvertedItem[];
};

/**
 * Default currency codes returned when no targets are provided.
 */
export const DEFAULTS_CURRENCY = ["USD", "EUR", "JPY", "GBP", "CNY"] as const;

/**
 * Re-bases exchange rates from USD to AUD (1 AUD -> target).
 *
 * @param rates - USD-based rates from the OXR API.
 * @returns Record mapping codes to AUD-based rates.
 */
export function rebaseToAUD(rates: Record<string, number>) {
  const out: Record<string, number> = {};
  const rAUD = rates.AUD;
  for (const k in rates) out[k] = rates[k] / rAUD;
  out.AUD = 1;
  return out;
}

/**
 * Fetches latest rates and returns an AUD-based subset for the requested targets.
 *
 * @param targets - Optional array of currency codes; defaults to `DEFAULTS_CURRENCY`.
 * @returns Object containing base, timestamp, and filtered rates map.
 */
export async function latestAudRates(targets?: string[]) {
  const { timestamp, rates } = await getLatest();
  const audRates = rebaseToAUD(rates);
  const list = targets && targets.length
    ? Array.from(new Set(targets.map((t) => t.toUpperCase().trim()).filter(Boolean)))
    : [...DEFAULTS_CURRENCY];
  const filtered: Record<string, number> = {};
  for (const c of list) if (audRates[c] != null) filtered[c] = audRates[c];
  return { base: "AUD" as const, timestamp, rates: filtered };
}
