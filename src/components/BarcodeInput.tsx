"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function BarcodeInput() {
  const [barcode, setBarcode] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = barcode.trim();
    if (trimmed) {
      router.push(`/scan?barcode=${trimmed}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Enter barcode number"
          className="w-full rounded-full border border-gray-200 bg-white py-3.5 pl-12 pr-24 text-base shadow-sm transition placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-700 dark:bg-[var(--bg-secondary)] dark:text-white dark:placeholder:text-gray-500"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-40"
          disabled={!barcode.trim()}
        >
          Scan
        </button>
      </div>
    </form>
  );
}
