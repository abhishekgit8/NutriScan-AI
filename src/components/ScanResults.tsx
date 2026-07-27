"use client";

import { ScanResult } from "@/types";
import { RiskScoreRing } from "./RiskBadge";
import IngredientsList from "./IngredientsList";
import SummaryPoints from "./SummaryPoints";
import AlertBanner from "./AlertBanner";
import ShareButton from "./ShareButton";
import { Bookmark, ThumbsUp, ThumbsDown, Tag } from "lucide-react";

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
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold md:text-2xl">{result.productName}</h2>
              {result.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  <Tag className="h-3 w-3" />
                  {result.category}
                </span>
              )}
            </div>
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
          <RiskScoreRing tier={result.riskTier} score={result.healthScore} />
        </div>
      </div>

      {result.alertMessage && <AlertBanner message={result.alertMessage} />}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 md:p-6">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          Summary
        </h3>
        <p className="text-sm leading-relaxed text-[var(--text)]">
          {result.analysis}
        </p>
      </div>

      {(result.pros?.length > 0 || result.cons?.length > 0) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {result.pros?.length > 0 && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/30">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
                <ThumbsUp className="h-4 w-4" />
                Pros
              </h3>
              <ul className="space-y-2">
                {result.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.cons?.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                <ThumbsDown className="h-4 w-4" />
                Cons
              </h3>
              <ul className="space-y-2">
                {result.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {result.summaryPoints.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 md:p-6">
          <SummaryPoints points={result.summaryPoints} />
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 md:p-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          Ingredients
        </h3>
        <IngredientsList
          ingredients={result.ingredients}
          flagged={result.flaggedIngredients || []}
        />
      </div>

      <p className="text-center text-xs text-[var(--text-secondary)]">
        {result.barcode}
      </p>
    </div>
  );
}
