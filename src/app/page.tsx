import Navbar from "@/components/Navbar";
import BarcodeInput from "@/components/BarcodeInput";
import { Leaf, Zap, Brain, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-20 md:py-28">
        <section className="flex flex-col items-center text-center">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-600/20">
            <Leaf className="h-8 w-8" />
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Know What You
            <span className="text-green-600"> Eat</span>
          </h1>

          <p className="mt-5 max-w-md text-base text-[var(--text-secondary)] md:text-lg">
            Scan any product barcode. Get instant AI-powered health analysis
            with ingredient breakdown and personalized insights.
          </p>

          <div className="mt-10 w-full">
            <BarcodeInput />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>Try:</span>
            {["5449000000996", "3017620422003", "8000500310427"].map((code) => (
              <a
                key={code}
                href={`/scan?barcode=${code}`}
                className="rounded-full bg-green-50 px-3 py-1 text-green-700 transition hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
              >
                {code}
              </a>
            ))}
          </div>
        </section>

        <section className="mt-24 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/30">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">Instant Analysis</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
              Get health scores and ingredient breakdowns in seconds.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/30">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">AI-Powered</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
              Powered by NaraRouter GLM-5.2 with Gemini fallback.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 sm:col-span-2 md:col-span-1">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/30">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">Health Alerts</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
              Personalized alerts for your dietary preferences.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--text-secondary)]">
        NutriScan AI — Know your food, choose better.
      </footer>
    </div>
  );
}
