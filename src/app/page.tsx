import Navbar from "@/components/Navbar";
import BarcodeInput from "@/components/BarcodeInput";
import { Scan, Shield, Zap, Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-16">
        <section className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/25">
            <Scan className="h-10 w-10" />
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Understand What
            <br />
            <span className="text-indigo-500">You Eat</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-[var(--text-secondary)]">
            Enter any product barcode and get instant AI-powered health analysis.
            Know exactly what&apos;s in your food before you buy it.
          </p>

          <div className="mt-10">
            <BarcodeInput />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>Try:</span>
            {["5449000000996", "3017620422003", "8000500310427"].map((code) => (
              <a
                key={code}
                href={`/scan?barcode=${code}`}
                className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-indigo-500 transition hover:bg-indigo-500/20"
              >
                {code}
              </a>
            ))}
          </div>
        </section>

        <section className="mt-24 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Instant Analysis</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Get health scores and ingredient breakdowns in seconds using
              advanced AI models.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Powered by NaraRouter GLM-5.2 with Gemini fallback for reliable,
              intelligent food analysis.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Health Alerts</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Get personalized alerts based on your dietary preferences and
              restrictions.
            </p>
          </div>
        </section>
      </main>

      <footer className="mt-24 border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text-secondary)]">
        <p>NutriScan AI &mdash; Know your food, choose better.</p>
      </footer>
    </div>
  );
}
