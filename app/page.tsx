// app/page.tsx
import { CurrencySidebar } from "@/components/sidebar/CurrencySidebar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full">
        <section className="flex min-h-screen w-full flex-col gap-5 px-4 py-6 sm:px-6 lg:w-1/3 md:w-1/2 lg:px-8 xl:px-10">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold">CURRENCY CONVERTER</h1>
          </header>

          <CurrencySidebar />
        </section>

        <div className="hidden flex-1 lg:block" />
      </div>
    </main>
  );
}
