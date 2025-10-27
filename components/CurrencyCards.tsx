"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, Input, Button, Skeleton } from "@/components/ui";

type Rates = Record<string, number>;
const TARGETS = ["USD", "EUR", "JPY", "GBP", "CNY"] as const;

export default function CurrencyCards() {
  const [rates, setRates] = useState<Rates | null>(null); // AUD 基准：1 AUD -> X
  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true); setErr("");
      const r = await fetch("/api/rates/latest", { cache: "no-store" });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || r.statusText);
      setRates(data?.rates ?? null);
    } catch (e:any) {
      setErr(e?.message || "Failed to load rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const amt = Number(amount) || 0;
  const fmtAmt = (n:number) => new Intl.NumberFormat(undefined,{maximumFractionDigits:2}).format(n);
  const fmtRate = (n:number) => new Intl.NumberFormat(undefined,{maximumFractionDigits:4}).format(n);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label htmlFor="aud-amount" className="text-sm text-muted-foreground">AUD Amount</label>
        <Input id="aud-amount" value={amount} onChange={e=>setAmount(e.target.value)} inputMode="decimal" className="max-w-[220px]" />
        <Button variant="outline" onClick={load}>Refresh rates</Button>
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({length:5}).map((_,i)=>(
            <Card key={i}><CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-20" />
            </CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {TARGETS.map(code=>{
            const rate = rates?.[code] ?? null;
            const out = rate==null ? null : amt*rate;
            return (
              <Card key={code} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-1">
                  <div className="text-sm text-muted-foreground">AUD → {code}</div>
                  <div className="text-2xl font-semibold tabular-nums">{out==null?"—":fmtAmt(out)}</div>
                  <div className="text-xs text-muted-foreground">Rate: {rate==null?"—":fmtRate(rate)}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
