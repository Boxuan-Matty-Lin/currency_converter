import CurrencyCards from "@/components/CurrencyCards";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Latest AUD Conversions</h1>
      <p className="text-sm text-muted-foreground">
        Using AUD as base. Click “Refresh rates” to fetch the latest snapshot.
      </p>
      <CurrencyCards />
    </main>
  );
}
