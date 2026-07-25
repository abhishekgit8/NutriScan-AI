import Navbar from "@/components/Navbar";
import BarcodeInput from "@/components/BarcodeInput";
import { Leaf, Zap, Brain, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <section className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-600/20">
            <Leaf className="h-7 w-7" />
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            Know What You
            <span className="text-green-600"> Eat</span>
          </h1>

          <p className="mt-4 max-w-md text-sm text-[var(--text-secondary)] md:text-base">
            Scan any product barcode or enter it manually. Get instant
            AI-powered health analysis with ingredient breakdown.
          </p>

          <div className="mt-8 w-full max-w-lg">
            <BarcodeInput />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
            <span>Try:</span>
            {["5449000000996", "3017620422003", "8000500310427"].map((code) => (
              <a
                key={code}
                href={`/scan?barcode=${code}`}
                className="rounded-full bg-green-50 px-2.5 py-1 text-green-700 transition hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
              >
                {code}
              </a>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-3 sm:grid-cols-2 md:mt-28 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">Instant Analysis</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              Health scores and ingredient breakdowns in seconds.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30">
              <Brain className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">AI-Powered</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              NaraRouter GLM-5.2 with Gemini fallback.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 sm:col-span-2 md:col-span-1">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">Health Alerts</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              Personalized alerts for your dietary needs.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-5 text-center text-xs text-[var(--text-secondary)]">
        NutriScan AI — Know your food, choose better.
      </footer>
    </div>
  );
}
