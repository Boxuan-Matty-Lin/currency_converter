

export function toISODateUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}


export function buildPastDatesUTC(days: number): string[] {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(todayUTC);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(toISODateUTC(d));
  }
  return out;
}