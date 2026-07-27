"use client";

import { FlaggedIngredient } from "@/types";
import { getFlaggedIngredientColor } from "@/lib/utils";
import { AlertTriangle, Info } from "lucide-react";

interface Props {
  ingredients: string[];
  flagged: FlaggedIngredient[];
}

export default function IngredientsList({ ingredients, flagged }: Props) {
  if (!ingredients.length) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        No ingredients data available.
      </p>
    );
  }

  const flaggedMap = new Map<string, FlaggedIngredient>();
  for (const f of flagged) {
    flaggedMap.set(f.name.toLowerCase(), f);
  }

  return (
    <div className="space-y-2">
      {flagged.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950/30">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            {flagged.length} ingredient{flagged.length > 1 ? "s" : ""} flagged for your health profile
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {ingredients.map((ingredient, i) => {
          const clean = ingredient.trim().toLowerCase();
          const match = flaggedMap.get(clean) ||
            [...flaggedMap.values()].find((f) => clean.includes(f.name));

          if (match) {
            return (
              <span
                key={i}
                className={`tooltip-trigger inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${getFlaggedIngredientColor(match.severity)}`}
              >
                {ingredient.trim()}
                <Info className="h-3 w-3 opacity-60" />
                <span className="tooltip-content">
                  <strong>{match.reason}</strong>
                  <br />
                  Severity: {match.severity}
                </span>
              </span>
            );
          }

          return (
            <span
              key={i}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {ingredient.trim()}
            </span>
          );
        })}
      </div>
    </div>
  );
}
