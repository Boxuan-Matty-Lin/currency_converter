import "server-only";
import { getHistorical, type HistoricalResponse } from "./oxr";
import { rebaseToAUD } from "./oxr_convert";
import { buildPastDatesUTC } from "../time_utils";
import { DEFAULTS_CURRENCY } from "./oxr_convert";

export type SeriesPoint = { date: string; value: number };
export type SeriesMap = Record<string, SeriesPoint[]>;
export type HistoryByDate = {
  base: "AUD";
  startDate: string;
  endDate: string;
  points: Array<{ date: string; [code: string]: number | string }>;
};

// Controls how many historical requests we fire in parallel.
const WORKER_CONCURRENCY = 4;
// How many times we retry a failing historical request before giving up.
const RETRY_ATTEMPTS = 3;
// Delay between retries to give the upstream API a moment to recover.
const RETRY_DELAY_MS = 100;

// Simple promise-based sleep helper used for retry backoff.
function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches a historical snapshot with limited retries to cope with transient OXR issues.
 *
 * @returns Historical payload on success, or an object describing the last error.
 */
async function fetchHistoricalWithRetry(date: string): Promise<HistoricalResponse | { error: unknown }> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      return await getHistorical(date);
    } catch (err) {
      lastError = err;
      if (attempt === RETRY_ATTEMPTS) break;
      await sleep(RETRY_DELAY_MS);
    }
  }

  return { error: lastError };
}

/**
 * Converts a USD-based rate map into a single AUD-based row for the requested targets.
 *
 * @param usdRates - Snapshot returned by OXR for a particular date.
 * @param targets - Currency codes to include in the output row.
 * @param date - ISO date string used as the row identifier.
 */
export function toAudRow(
  usdRates: Record<string, number>,
  targets: string[],
  date: string
): { date: string; [code: string]: number | string } {
  const audRates = rebaseToAUD(usdRates);
  const row: Record<string, number | string> = { date };
  for (const t of targets) if (audRates[t] != null) row[t] = audRates[t];
  return row as { date: string; [code: string]: number | string }; 
}



/**
 * Builds a history table of AUD-based exchange rates for the given period.
 *
 * @param days - Number of UTC calendar days to fetch (counting back from today).
 * @param targets - Target currencies to include in each row.
 */
export async function getHistoryByDateAUD(days: number, targets: string[]): Promise<HistoryByDate> {
  const dates = buildPastDatesUTC(days);
  const upperTargets = Array.from(new Set(targets.map(s => s.toUpperCase())));
  const concurrency = Math.min(WORKER_CONCURRENCY, dates.length);
  const points: (HistoryByDate["points"][number] | undefined)[] = new Array(dates.length);
  let index = 0;

  // Small worker pool that processes pending dates until exhausted.
  const worker = async () => {
    while (true) {
      const current = index++;
      if (current >= dates.length) break;
      const date = dates[current];
      const result = await fetchHistoricalWithRetry(date);
      if (result && "rates" in result) {
        points[current] = toAudRow(result.rates, upperTargets, date);
      } else {
        points[current] = { date, error: "fetch_failed" };
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  return {
    base: "AUD",
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    points: points.filter(Boolean) as HistoryByDate["points"],
  };
}

/**
 * Transposes date-based history rows into per-currency time series.
 *
 * @param points - History rows produced by `getHistoryByDateAUD`.
 * @param targets - Currency codes to extract series for; defaults to the standard set.
 */
export function toByCurrency(
  points: HistoryByDate["points"],
  targets: readonly string[] = DEFAULTS_CURRENCY
): SeriesMap {
  const series: SeriesMap = {};
  for (const t of targets) series[t] = [];

  for (const row of points) {
    const d = row.date; // 已是 string
    for (const t of targets) {
      const v = row[t];
      if (typeof v === "number") series[t].push({ date: d, value: v });
    }
  }
  return series;
}
