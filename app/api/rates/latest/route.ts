// src/app/api/rates/latest/route.ts
import { NextRequest, NextResponse } from "next/server";
import { latestAudRates, DEFAULTS_CURRENCY } from "@/lib/server/oxr_convert";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const targetsParam = searchParams.get("targets");
    const targets = targetsParam ? targetsParam.split(",") : [...DEFAULTS_CURRENCY];

    const data = await latestAudRates(targets);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "fetch failed" }, { status: 502 });
  }
}
