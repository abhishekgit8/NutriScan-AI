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
      className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm transition hover:bg-[var(--bg-secondary)]"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
