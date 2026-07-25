"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import BarcodeInput from "@/components/BarcodeInput";
import ScanResults from "@/components/ScanResults";
import SkeletonCard from "@/components/SkeletonCard";
import { AlertCircle, RefreshCw } from "lucide-react";
import { ScanResult } from "@/types";
import { useUser } from "@clerk/nextjs";

function useScanFetcher(barcode: string | null) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(new Set<string>());

  useEffect(() => {
    if (!barcode || fetchedRef.current.has(barcode)) return;
    fetchedRef.current.add(barcode);

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
  }, [barcode]);

  const refetch = () => {
    fetchedRef.current.delete(barcode || "");
  };

  return { result, loading, error, refetch };
}

function ScanPageContent() {
  const searchParams = useSearchParams();
  const barcode = searchParams.get("barcode");
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

      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold">Scan a Product</h1>
          <BarcodeInput />
        </div>

        {loading && <SkeletonCard />}

        {error && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950/30">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-400">
                Error
              </p>
              <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                {error}
              </p>
            </div>
            <button
              onClick={refetch}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
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
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-8 text-center">
            <AlertCircle className="h-12 w-12 text-[var(--text-secondary)]" />
            <div>
              <p className="font-medium">Product not found</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                No data available for barcode &quot;{barcode}&quot;. Try
                another one.
              </p>
            </div>
          </div>
        )}

        {!barcode && !loading && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-8 text-center">
            <p className="text-[var(--text-secondary)]">
              Enter a barcode above to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <SkeletonCard />
        </main>
      </div>
    }>
      <ScanPageContent />
    </Suspense>
  );
}
