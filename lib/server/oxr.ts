// lib/server/oxr.ts
import "server-only";

const OXR_APP_ID = process.env.OXR_APP_ID;
const OXR_BASE_URL = process.env.OXR_BASE_URL;

if (!OXR_APP_ID) {
    console.warn("[oxr] OXR_APP_ID is not set. Calls will fail.");
}
if (!OXR_BASE_URL) {
    console.warn("[oxr] OXR_BASE_URL is not set. Calls will fail.");
}


export type RatesResponse = {
    timestamp: number;                   // second（UTC）
    base: string;                        // USD
    rates: Record<string, number>;       // USD -> *
    disclaimer?: string;
    license?: string;
};

// universal fetch wrapper (no-cache + error handling)
async function oxrFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${OXR_BASE_URL}${path}${path.includes("?") ? "&" : "?"}app_id=${OXR_APP_ID}`;
    const res = await fetch(url, { cache: "no-store", ...init });
    if (!res.ok) {
        let body = "";
        try { body = await res.text(); } catch { }
        throw new Error(`OXR ${res.status}: ${body || res.statusText}`);
    }
    return res.json() as Promise<T>;
}


// Get latest exchange rates
export async function getLatest(): Promise<RatesResponse> {
  return oxrFetch<RatesResponse>("/latest.json");
}





