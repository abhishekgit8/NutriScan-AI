"use client";

import { ScanResult } from "@/types";
import HealthScoreRing from "./HealthScoreRing";
import IngredientsList from "./IngredientsList";
import SummaryPoints from "./SummaryPoints";
import AlertBanner from "./AlertBanner";
import ShareButton from "./ShareButton";
import { Bookmark } from "lucide-react";

interface Props {
  result: ScanResult;
  onSave?: () => void;
  isSaved?: boolean;
}

export default function ScanResults({ result, onSave, isSaved }: Props) {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold md:text-2xl">{result.productName}</h2>
            {result.brand && (
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                {result.brand}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {onSave && (
              <button
                onClick={onSave}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium transition hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Bookmark
                  className={`h-3.5 w-3.5 ${isSaved ? "fill-green-600 text-green-600" : ""}`}
                />
                {isSaved ? "Saved" : "Save"}
              </button>
            )}
            <ShareButton
              productName={result.productName}
              healthScore={result.healthScore}
              barcode={result.barcode}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <HealthScoreRing score={result.healthScore} />
        </div>
      </div>

      {result.alertMessage && <AlertBanner message={result.alertMessage} />}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 md:p-6">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          AI Analysis
        </h3>
        <p className="text-sm leading-relaxed text-[var(--text)]">
          {result.analysis}
        </p>
      </div>

      {result.summaryPoints.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 md:p-6">
          <SummaryPoints points={result.summaryPoints} />
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 md:p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          Ingredients
        </h3>
        <IngredientsList ingredients={result.ingredients} />
      </div>

      <p className="text-center text-xs text-[var(--text-secondary)]">
        {result.barcode}
      </p>
    </div>
  );
}
