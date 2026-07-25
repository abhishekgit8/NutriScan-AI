"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BarcodeInput from "@/components/BarcodeInput";
import ScanResults from "@/components/ScanResults";
import SkeletonCard from "@/components/SkeletonCard";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { ScanResult } from "@/types";
import { useUser } from "@clerk/nextjs";

function useScanFetcher(barcode: string | null) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!barcode) return;

    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const res = await fetch(`/api/scan?barcode=${barcode}`, {
          signal: controller.signal,
        });
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
  }, [barcode, retryCount]);

  const refetch = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  return { result, loading, error, refetch };
}

export default function ScanPageClient() {
  const searchParams = useSearchParams();
  const barcode = searchParams.get("barcode");
  const router = useRouter();
  const { user } = useUser();

  const { result, loading, error, refetch } = useScanFetcher(barcode);
  const [isSaved, setIsSaved] = useState(false);

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
        }),
      });
      setIsSaved(true);
    } catch {
      // silently fail
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 py-6 md:py-10">
        <div className="mb-6 flex flex-col items-center gap-4">
          <h1 className="text-xl font-bold md:text-2xl">Scan a Product</h1>
          <BarcodeInput />
        </div>

        {loading && <SkeletonCard />}

        {error && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/30">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={refetch}
                className="flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try Again
              </button>
              <button
                onClick={() => router.push("/scan")}
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

        {!barcode && !loading && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Scan a barcode or enter one above.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
