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
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Enter product barcode (e.g., 5449000000996)"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-4 pl-12 pr-32 text-lg shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="submit"
          className="absolute right-2 rounded-lg bg-indigo-500 px-6 py-2.5 font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
          disabled={!barcode.trim()}
        >
          Scan
        </button>
      </div>
    </form>
  );
}
