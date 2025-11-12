// app/api/rates/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getHistoryByDateAUD, toByCurrency } from "@/lib/server/oxr_history";
import { DEFAULTS_CURRENCY } from "@/lib/server/oxr_convert";

/**
 * Responds with AUD-based historical exchange rates.
 *
 * Query params:
 *  - days: number of days to fetch (1–60, defaults to 14)
 *  - orient: when set to "byCurrency", the response is transformed into currency keyed series.
 *            Otherwise, the raw date-row data is returned.
 */
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams;
    const days = Math.max(1, Math.min(60, Number(q.get("days")) || 14));
    const orient = (q.get("orient") || "byCurrency").toLowerCase();

    const data = await getHistoryByDateAUD(days, DEFAULTS_CURRENCY);

    if (orient === "bycurrency") {
      return NextResponse.json({
        base: data.base,
        startDate: data.startDate,
        endDate: data.endDate,
        series: toByCurrency(data.points, DEFAULTS_CURRENCY),
      }, { headers: { "Cache-Control": "public, max-age=300" } });
    }
    return NextResponse.json(data, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "history fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
