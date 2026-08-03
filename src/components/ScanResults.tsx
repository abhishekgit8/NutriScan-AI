"use client";

import { ScanResult } from "@/types";
import IngredientsList from "./IngredientsList";
import { AlertTriangle, ChevronDown, Share2, Bookmark } from "lucide-react";
import { useState } from "react";

interface Props {
  result: ScanResult;
  onSave?: () => void;
  isSaved?: boolean;
}

function getGrade(score: number): { letter: string; color: string; bgColor: string; textColor: string } {
  if (score >= 80) return { letter: "A", color: "#006c49", bgColor: "rgba(16, 185, 129, 0.15)", textColor: "#00422b" };
  if (score >= 60) return { letter: "B", color: "#006c49", bgColor: "rgba(16, 185, 129, 0.1)", textColor: "#00422b" };
  if (score >= 40) return { letter: "C", color: "#855300", bgColor: "rgba(254, 166, 25, 0.15)", textColor: "#684000" };
  if (score >= 20) return { letter: "D", color: "#855300", bgColor: "rgba(254, 166, 25, 0.2)", textColor: "#684000" };
  return { letter: "E", color: "#bc0b3b", bgColor: "rgba(255, 120, 134, 0.15)", textColor: "#780021" };
}

export default function ScanResults({ result, onSave, isSaved }: Props) {
  const grade = getGrade(result.healthScore);
  const [showAllergens, setShowAllergens] = useState(false);

  return (
    <div className="animate-fade-in space-y-5">
      {/* Product Summary */}
      <section className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0"
          style={{ border: "1px solid var(--outline-variant)" }}
        >
          <div
            className="w-full h-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: "var(--surface-container)", color: "var(--on-surface-variant)" }}
          >
            {result.productName.charAt(0)}
          </div>
        </div>
        <div className="flex flex-col justify-center min-w-0">
          {result.category && (
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--secondary)" }}
            >
              {result.category}
            </p>
          )}
          <h2
            className="text-xl font-bold leading-tight truncate"
            style={{ color: "var(--on-surface)", fontFamily: "Inter" }}
          >
            {result.productName}
          </h2>
          {result.brand && (
            <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>
              {result.brand}
            </p>
          )}
        </div>
      </section>

      {/* Score Card Widget */}
      <section
        className="rounded-xl p-4 space-y-3"
        style={{
          backgroundColor: grade.bgColor,
          border: `1px solid ${grade.color}20`,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex flex-col items-center justify-center rounded-xl shadow-md flex-shrink-0"
            style={{
              backgroundColor: grade.color,
              color: "#ffffff",
              width: "96px",
              height: "96px",
            }}
          >
            <span className="text-4xl font-extrabold leading-none" style={{ fontFamily: "Inter" }}>
              {grade.letter}
            </span>
            <span className="text-xs font-bold opacity-80">{result.healthScore}/100</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <svg className="w-4 h-4" style={{ color: grade.color }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: grade.color }}
              >
                AI Summary
              </span>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--on-surface)" }}
            >
              {result.analysis}
            </p>
          </div>
        </div>
      </section>

      {/* Red Flags Section */}
      {result.cons && result.cons.length > 0 && (
        <section className="space-y-3">
          <h3
            className="flex items-center gap-2 text-lg font-semibold"
            style={{ color: "var(--on-surface)", fontFamily: "Inter" }}
          >
            <AlertTriangle className="h-5 w-5" style={{ color: "var(--tertiary)" }} />
            Red Flags
          </h3>
          <div className="space-y-2">
            {result.cons.map((con, i) => (
              <div
                key={i}
                className="glass-card flex items-start gap-3 p-4 rounded-xl"
              >
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: "var(--tertiary)" }}
                />
                <div>
                  <h4 className="font-semibold" style={{ color: "var(--on-surface)" }}>
                    {con.split("—")[0].split(":")[0].trim()}
                  </h4>
                  <p
                    className="text-sm"
                    style={{ color: "var(--on-surface-variant)" }}
                  >
                    {con.includes("—") ? con.split("—")[1].trim() : con.includes(":") ? con.split(":").slice(1).join(":").trim() : con}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pros Section */}
      {result.pros && result.pros.length > 0 && (
        <section className="space-y-3">
          <h3
            className="flex items-center gap-2 text-lg font-semibold"
            style={{ color: "var(--on-surface)", fontFamily: "Inter" }}
          >
            <svg className="w-5 h-5" style={{ color: "var(--primary)" }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Good Points
          </h3>
          <div className="space-y-2">
            {result.pros.map((pro, i) => (
              <div
                key={i}
                className="glass-card flex items-start gap-3 p-4 rounded-xl"
              >
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: "var(--primary)" }}
                />
                <p className="text-sm" style={{ color: "var(--on-surface)" }}>
                  {pro}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ingredients Accordion */}
      <section className="space-y-3">
        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--on-surface)", fontFamily: "Inter" }}
        >
          Full Ingredients
        </h3>
        <IngredientsList
          ingredients={result.ingredients}
          flagged={result.flaggedIngredients || []}
        />
      </section>

      {/* Allergens Accordion (placeholder) */}
      <div
        className="border overflow-hidden bg-white rounded-xl"
        style={{ borderColor: "var(--outline-variant)" }}
      >
        <button
          onClick={() => setShowAllergens(!showAllergens)}
          className="flex w-full items-center justify-between p-4 transition-colors hover:bg-[var(--surface-container-low)]"
        >
          <span className="font-semibold" style={{ color: "var(--on-surface)" }}>
            Allergens
          </span>
          <ChevronDown
            className="h-5 w-5 transition-transform"
            style={{
              color: "var(--on-surface-variant)",
              transform: showAllergens ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>
        {showAllergens && (
          <div className="border-t px-4 pb-4" style={{ borderColor: "var(--outline-variant)" }}>
            <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>
              Check ingredient list for potential allergens.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {onSave && (
          <button
            onClick={onSave}
            className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all active:scale-95"
            style={{
              backgroundColor: isSaved ? "var(--primary)" : "var(--surface-container)",
              color: isSaved ? "var(--on-primary)" : "var(--on-surface)",
              border: `1px solid ${isSaved ? "var(--primary)" : "var(--outline-variant)"}`,
            }}
          >
            <Bookmark className="h-4 w-4" />
            {isSaved ? "Saved" : "Save"}
          </button>
        )}
        <button
          className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all active:scale-95"
          style={{
            backgroundColor: "var(--surface-container)",
            color: "var(--on-surface)",
            border: "1px solid var(--outline-variant)",
          }}
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      {/* Barcode */}
      <p className="text-center text-xs" style={{ color: "var(--on-surface-variant)" }}>
        {result.barcode}
      </p>
    </div>
  );
}
