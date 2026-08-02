"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BarcodeInput from "@/components/BarcodeInput";
import HealthProfileBanner from "@/components/HealthProfileBanner";
import ScanResults from "@/components/ScanResults";
import SkeletonCard from "@/components/SkeletonCard";
import { AlertCircle, ArrowLeft, RefreshCw, SearchX, Camera, Type } from "lucide-react";
import { ScanResult, HealthTag } from "@/types";
import { useUser } from "@clerk/nextjs";

function useScanFetcher(barcode: string | null, ingredients: string | null) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!barcode && !ingredients) return;

    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);
      setResult(null);

      let activeTags: HealthTag[] = [];
      try {
        const stored = localStorage.getItem("healthTags");
        if (stored) activeTags = JSON.parse(stored);
      } catch {}

      try {
        let url: string;
        if (ingredients) {
          url = `/api/scan?ingredients=${encodeURIComponent(ingredients)}&tags=${activeTags.join(",")}`;
        } else {
          url = `/api/scan?barcode=${barcode}&tags=${activeTags.join(",")}`;
        }

        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to scan product");
        setResult(data);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, [barcode, ingredients, retryCount]);

  const refetch = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  return { result, loading, error, refetch };
}

function ProductNotFound({ barcode, onReset, onSwitchMode }: { barcode: string; onReset: () => void; onSwitchMode: (mode: "image" | "text") => void }) {
  return (
    <div className="animate-fade-in rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <SearchX className="h-7 w-7 text-gray-400" />
      </div>

      <h2 className="text-lg font-bold">Product Not Found</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Barcode <span className="font-mono font-medium">{barcode}</span> isn&apos;t in our database yet.
      </p>

      <div className="mt-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          Try one of these instead:
        </p>

        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => onSwitchMode("image")}
            className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-4 text-left transition hover:bg-[var(--bg-secondary)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/30">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Photograph the Label</p>
              <p className="text-xs text-[var(--text-secondary)]">
                AI will extract and analyze the ingredients
              </p>
            </div>
          </button>

          <button
            onClick={() => onSwitchMode("image")}
            className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-4 text-left transition hover:bg-[var(--bg-secondary)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Photograph the Food</p>
              <p className="text-xs text-[var(--text-secondary)]">
                AI identifies the food and estimates nutrition
              </p>
            </div>
          </button>

          <button
            onClick={() => onSwitchMode("text")}
            className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-4 text-left transition hover:bg-[var(--bg-secondary)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/30">
              <Type className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Paste Ingredients</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Copy the ingredient list from the product
              </p>
            </div>
          </button>
        </div>
      </div>

      <button
        onClick={onReset}
        className="mt-4 text-xs text-[var(--text-secondary)] underline hover:text-[var(--text)]"
      >
        Scan a different barcode
      </button>
    </div>
  );
}

export default function ScanPageClient() {
  const searchParams = useSearchParams();
  const barcode = searchParams.get("barcode");
  const ingredients = searchParams.get("ingredients");
  const router = useRouter();
  const { user } = useUser();

  const { result: urlResult, loading: urlLoading, error: urlError, refetch } = useScanFetcher(barcode, ingredients);

  // Image scan state
  const [imageResult, setImageResult] = useState<ScanResult | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [switchMode, setSwitchMode] = useState<"image" | "text" | null>(null);

  // Merge results
  const result = urlResult || imageResult;
  const loading = urlLoading || imageLoading;
  const error = urlError || imageError;

  // Detect "product not found" specifically
  const isNotFound =
    error?.toLowerCase().includes("product not found") ||
    error?.toLowerCase().includes("not found in") ||
    false;

  const handleSave = async () => {
    if (!result || !user) return;
    try {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_scan",
          barcode: result.barcode,
          productName: result.productName,
          healthScore: result.healthScore,
          riskTier: result.riskTier,
        }),
      });
      setIsSaved(true);
    } catch {}
  };

  const clearImageState = () => {
    setImageResult(null);
    setImageError(null);
    setImageLoading(false);
  };

  // Clear switchMode after BarcodeInput has rendered with it
  useEffect(() => {
    if (switchMode) {
      const t = setTimeout(() => setSwitchMode(null), 100);
      return () => clearTimeout(t);
    }
  }, [switchMode]);

  const resetAll = () => {
    clearImageState();
    router.push("/scan");
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 py-6 md:py-10">
        <div className="mb-4 flex flex-col items-center gap-3">
          <h1 className="text-xl font-bold md:text-2xl">Scan a Product</h1>
          <HealthProfileBanner />
        </div>

        <div className="mb-6">
          <BarcodeInput
            defaultMode={switchMode || undefined}
            onImageResult={(data) => {
              clearImageState();
              setImageResult(data as ScanResult);
            }}
            onImageError={(msg) => {
              clearImageState();
              setImageError(msg);
            }}
            onImageLoading={(isLoading) => {
              setImageLoading(isLoading);
              if (isLoading) setImageError(null);
            }}
            tags={(() => {
              try {
                const stored = localStorage.getItem("healthTags");
                return stored ? JSON.parse(stored) : [];
              } catch {
                return [];
              }
            })()}
          />
        </div>

        {loading && <SkeletonCard />}

        {/* Product Not Found — friendly fallback */}
        {isNotFound && barcode && (
          <ProductNotFound
            barcode={barcode}
            onReset={clearImageState}
            onSwitchMode={(mode) => {
              clearImageState();
              setSwitchMode(mode);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {/* Generic error */}
        {error && !isNotFound && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (imageError) {
                    clearImageState();
                  } else {
                    refetch();
                  }
                }}
                className="flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try Again
              </button>
              <button
                onClick={resetAll}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-2 text-sm font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            </div>
          </div>
        )}

        {result && (
          <ScanResults
            result={result}
            onSave={user ? handleSave : undefined}
            isSaved={isSaved}
          />
        )}

        {!loading && !error && !result && barcode && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              No data found for &quot;{barcode}&quot;.
            </p>
          </div>
        )}

        {!loading && !error && !result && ingredients && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Analyzing your ingredients...
            </p>
          </div>
        )}

        {!barcode && !ingredients && !loading && !imageLoading && !result && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Scan a barcode, photograph a label, or paste ingredients above.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
