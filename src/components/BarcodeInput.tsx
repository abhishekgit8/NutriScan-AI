"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Camera, Type, FileText } from "lucide-react";
import dynamic from "next/dynamic";

const BarcodeScanner = dynamic(() => import("./BarcodeScanner"), {
  ssr: false,
  loading: () => null,
});

const ImageScanner = dynamic(() => import("./ImageScanner"), {
  ssr: false,
  loading: () => null,
});

type InputMode = "barcode" | "image" | "text";

interface Props {
  onImageResult?: (data: unknown) => void;
  onImageError?: (msg: string) => void;
  onImageLoading?: (loading: boolean) => void;
  tags?: string[];
}

export default function BarcodeInput({ onImageResult, onImageError, onImageLoading, tags = [] }: Props) {
  const [mode, setMode] = useState<InputMode>("barcode");
  const [barcode, setBarcode] = useState("");
  const [ingredientText, setIngredientText] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const router = useRouter();

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = barcode.replace(/[^0-9]/g, "");
    if (cleaned.length >= 8) {
      router.push(`/scan?barcode=${cleaned}`);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredientText.trim().length > 3) {
      const encoded = encodeURIComponent(ingredientText.trim());
      router.push(`/scan?ingredients=${encoded}`);
    }
  };

  const handleScan = (result: string) => {
    const cleaned = result.replace(/[^0-9]/g, "");
    setShowScanner(false);
    setBarcode(cleaned);
    if (cleaned.length >= 8) {
      router.push(`/scan?barcode=${cleaned}`);
    } else {
      setScanError(`Scanned "${result}" doesn't look like a product barcode.`);
    }
  };

  const handleImageResult = useCallback((data: unknown) => {
    onImageResult?.(data);
  }, [onImageResult]);

  const handleImageError = useCallback((msg: string) => {
    onImageError?.(msg);
    setScanError(msg);
  }, [onImageError]);

  const handleImageLoading = useCallback((loading: boolean) => {
    onImageLoading?.(loading);
  }, [onImageLoading]);

  const tabs = [
    { id: "barcode" as InputMode, label: "Barcode", icon: Camera },
    { id: "image" as InputMode, label: "Image", icon: FileText },
    { id: "text" as InputMode, label: "Text", icon: Type },
  ];

  return (
    <>
      {scanError && (
        <div className="mb-3 w-full max-w-lg rounded-lg bg-red-50 p-3 text-center text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {scanError}
          <button onClick={() => setScanError(null)} className="ml-2 underline">
            dismiss
          </button>
        </div>
      )}

      <div className="w-full max-w-lg">
        {/* Tab bar */}
        <div className="mb-3 flex rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id);
                setScanError(null);
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${
                mode === tab.id
                  ? "bg-white text-green-700 shadow-sm dark:bg-gray-800 dark:text-green-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Barcode mode */}
        {mode === "barcode" && (
          <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={barcode}
                onChange={(e) => {
                  setBarcode(e.target.value.replace(/[^0-9]/g, ""));
                  setScanError(null);
                }}
                placeholder="Enter barcode number"
                className="w-full rounded-full border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm transition placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-700 dark:bg-[var(--bg-secondary)] dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setScanError(null);
                setShowScanner(true);
              }}
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
          </form>
        )}

        {/* Image mode */}
        {mode === "image" && (
          <ImageScanner
            onResult={handleImageResult}
            onError={handleImageError}
            onLoading={handleImageLoading}
            tags={tags}
          />
        )}

        {/* Text mode */}
        {mode === "text" && (
          <form onSubmit={handleTextSubmit} className="space-y-2">
            <textarea
              value={ingredientText}
              onChange={(e) => setIngredientText(e.target.value)}
              placeholder="Paste ingredient list here... e.g. Sugar, Palm Oil, Salt, Maltodextrin, Artificial Flavours"
              rows={3}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-700 dark:bg-[var(--bg-secondary)] dark:text-white dark:placeholder:text-gray-500"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 disabled:opacity-40"
              disabled={ingredientText.trim().length < 4}
            >
              Analyze Ingredients
            </button>
          </form>
        )}
      </div>

      {showScanner && (
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </>
  );
}
