// lib/server/oxr.ts
import "server-only";

/**
 * Retrieves and validates the OXR application id from the environment.
 *
 * @returns Trimmed `OXR_APP_ID` string.
 * @throws If the variable is missing or blank.
 */
function getAppId() {
  const v = process.env.OXR_APP_ID?.trim();
  if (!v) throw new Error("[oxr] OXR_APP_ID is not set");
  return v;
}

/**
 * Reads the OXR base URL, trimming whitespace and trailing slash.
 *
 * @returns Base URL without trailing slash.
 * @throws If the variable is missing or blank.
 */
function getBaseUrl() {
  const v = process.env.OXR_BASE_URL?.trim();
  if (!v) throw new Error("[oxr] OXR_BASE_URL is not set");
  return v.endsWith("/") ? v.slice(0, -1) : v;
}

/**
 * Shape of Open Exchange Rates `/latest.json` payload.
 */
export type RatesResponse = {
  timestamp: number;
  base: string;
  rates: Record<string, number>;
  disclaimer?: string;
  license?: string;
};

/**
 * Performs a fetch request against OXR, adding app id query param and handling errors.
 *
 * @param path - API path such as `/latest.json`.
 * @param init - Optional request overrides.
 * @returns Parsed JSON response typed as `T`.
 * @throws When HTTP status is not ok; includes response text when available.
 */
async function oxrFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getBaseUrl();
  const appId = getAppId();
  const url = `${base}${path}${path.includes("?") ? "&" : "?"}app_id=${appId}`;
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {
      // ignore read errors
    }
    throw new Error(`OXR ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Fetches the latest exchange rates from Open Exchange Rates.
 *
 * @returns A promise resolving to the `RatesResponse` payload.
 */
export async function getLatest(): Promise<RatesResponse> {
  return oxrFetch<RatesResponse>("/latest.json");
}




