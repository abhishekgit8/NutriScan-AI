"use client";

import { ScanResult } from "@/types";
import HealthScoreRing from "./HealthScoreRing";
import IngredientsList from "./IngredientsList";
import SummaryPoints from "./SummaryPoints";
import AlertBanner from "./AlertBanner";
import ShareButton from "./ShareButton";
import { Save, Bookmark } from "lucide-react";

interface Props {
  result: ScanResult;
  onSave?: () => void;
  isSaved?: boolean;
}

export default function ScanResults({ result, onSave, isSaved }: Props) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{result.productName}</h2>
            {result.brand && (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {result.brand}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onSave && (
              <button
                onClick={onSave}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm transition hover:bg-[var(--bg-secondary)]"
              >
                {isSaved ? (
                  <Bookmark className="h-4 w-4 fill-indigo-500 text-indigo-500" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
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

        <div className="mt-6 flex justify-center">
          <HealthScoreRing score={result.healthScore} />
        </div>
      </div>

      {result.alertMessage && <AlertBanner message={result.alertMessage} />}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold">AI Analysis</h3>
        <p className="leading-relaxed text-[var(--text-secondary)]">
          {result.analysis}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 shadow-sm">
        <SummaryPoints points={result.summaryPoints} />
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold">Ingredients</h3>
        <IngredientsList ingredients={result.ingredients} />
      </div>

      <p className="text-center text-xs text-[var(--text-secondary)]">
        Barcode: {result.barcode}
      </p>
    </div>
  );
}
