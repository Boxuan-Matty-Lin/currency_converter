
import { NextRequest, NextResponse } from "next/server";
import { latestAudRates, DEFAULTS_CURRENCY } from "@/lib/server/oxr_convert";

/**
 * GET /api/rates/latest
 *
 * Returns latest AUD-based exchange rates, optionally filtered by targets.
 *
 * Query:
 *  - targets?: comma-separated currency codes (e.g. "USD,EUR")
 *    (defaults to USD, EUR, JPY, GBP, CNY when omitted)
 *
 * Response:
 *  { base: "AUD", timestamp: number, rates: Record<currency, rate> }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const targetsParam = searchParams.get("targets");
    const targets = targetsParam ? targetsParam.split(",") : [...DEFAULTS_CURRENCY];

    const data = await latestAudRates(targets);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
