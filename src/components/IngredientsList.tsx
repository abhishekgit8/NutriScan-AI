"use client";

import { useState } from "react";
import { FlaggedIngredient } from "@/types";
import { ChevronDown } from "lucide-react";

interface Props {
  ingredients: string[];
  flagged: FlaggedIngredient[];
}

function getIngredientSafety(
  name: string,
  flagged: FlaggedIngredient[]
): { label: "Safe" | "Moderate" | "Risk"; color: string; bgColor: string } {
  const clean = name.trim().toLowerCase();
  const match = flagged.find(
    (f) => clean.includes(f.name.toLowerCase()) || f.name.toLowerCase().includes(clean)
  );

  if (match) {
    if (match.severity === "high") {
      return { label: "Risk", color: "#780021", bgColor: "rgba(255, 120, 134, 0.25)" };
    }
    return { label: "Moderate", color: "#684000", bgColor: "rgba(254, 166, 25, 0.2)" };
  }

  return { label: "Safe", color: "#00422b", bgColor: "rgba(16, 185, 129, 0.2)" };
}

export default function IngredientsList({ ingredients, flagged }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  if (!ingredients.length) {
    return (
      <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>
        No ingredients data available.
      </p>
    );
  }

  return (
    <div
      className="border overflow-hidden bg-white"
      style={{
        borderColor: "var(--outline-variant)",
        borderRadius: "12px",
      }}
    >
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-[var(--surface-container-low)]"
      >
        <span className="font-semibold" style={{ color: "var(--on-surface)" }}>
          Main Ingredients ({ingredients.length})
        </span>
        <ChevronDown
          className="h-5 w-5 transition-transform"
          style={{
            color: "var(--on-surface-variant)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="border-t" style={{ borderColor: "var(--outline-variant)" }}>
          {ingredients.map((ingredient, i) => {
            const safety = getIngredientSafety(ingredient, flagged);
            return (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3"
                style={{
                  borderBottom: i < ingredients.length - 1 ? "1px solid var(--outline-variant)" : "none",
                }}
              >
                <span
                  className="text-sm"
                  style={{
                    color: "var(--on-surface)",
                    fontFamily: "Inter",
                    fontSize: "15px",
                    lineHeight: "22px",
                    letterSpacing: "0.01em",
                  }}
                >
                  {ingredient.trim()}
                </span>
                <span
                  className="px-2 py-0.5 text-xs font-bold rounded-full"
                  style={{
                    backgroundColor: safety.bgColor,
                    color: safety.color,
                  }}
                >
                  {safety.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
