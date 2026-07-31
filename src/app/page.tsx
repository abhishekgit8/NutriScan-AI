import Navbar from "@/components/Navbar";
import BarcodeInput from "@/components/BarcodeInput";
import { Leaf, Zap, Brain, Shield, ShieldCheck, Camera, Image as ImageIcon, Type } from "lucide-react";

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
            Scan barcodes, photograph ingredient labels, or snap food items. Get instant
            AI-powered health analysis personalized to your health profile.
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
              <Camera className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">Barcode Scan</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              Scan any product barcode with your camera for instant results.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30">
              <ImageIcon className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">Label Photo</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              Photograph ingredient labels — AI extracts and analyzes text.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">Food Photo</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              Snap unlabeled food — AI identifies it and estimates nutrition.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30">
              <Brain className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">AI-Powered</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              NaraRouter Agnes 2.5 Flash with Gemini fallback.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">Risk Tiers</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              Safe, Caution, or High Risk — clear at-a-glance ratings.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">Health Profiles</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              Set your conditions — Pre-Diabetes, Allergens, PCOS & more.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30">
              <Type className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold">Paste Ingredients</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              No barcode? Paste raw ingredient text for instant analysis.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold">Flagged Ingredients</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              Problem ingredients highlighted with explanations.
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
