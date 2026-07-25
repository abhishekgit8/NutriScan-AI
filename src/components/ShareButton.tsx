"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  productName: string;
  healthScore: number;
  barcode: string;
}

export default function ShareButton({ productName, healthScore, barcode }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `Check out ${productName} on NutriScan AI! Health Score: ${healthScore}/100\n${window.location.origin}/scan?barcode=${barcode}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: productName, text });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium transition hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Share2 className="h-3.5 w-3.5" />
      )}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
