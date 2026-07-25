"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Camera } from "lucide-react";
import dynamic from "next/dynamic";

const BarcodeScanner = dynamic(() => import("./BarcodeScanner"), {
  ssr: false,
  loading: () => null,
});

export default function BarcodeInput() {
  const [barcode, setBarcode] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = barcode.trim();
    if (trimmed) {
      router.push(`/scan?barcode=${trimmed}`);
    }
  };

  const handleScan = (result: string) => {
    setShowScanner(false);
    setBarcode(result);
    router.push(`/scan?barcode=${result}`);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Enter barcode number"
              className="w-full rounded-full border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm transition placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-700 dark:bg-[var(--bg-secondary)] dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-[var(--bg-secondary)] dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Scan</span>
          </button>
          <button
            type="submit"
            className="rounded-full bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 disabled:opacity-40"
            disabled={!barcode.trim()}
          >
            Go
          </button>
        </div>
      </form>

      {showScanner && (
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </>
  );
}
