import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskTier, HealthTag, FlaggedIngredient } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Risk Tier Helpers ---

export function getRiskTierFromScore(score: number, flaggedCount: number): RiskTier {
  if (score >= 70 && flaggedCount === 0) return "safe";
  if (score >= 40 || flaggedCount <= 2) return "caution";
  return "high_risk";
}

export function getRiskTierConfig(tier: RiskTier) {
  switch (tier) {
    case "safe":
      return {
        label: "Safe",
        emoji: "\u{1F7E2}",
        color: "#16a34a",
        bgClass: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900",
        textClass: "text-green-700 dark:text-green-400",
        badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
        ringClass: "stroke-green-500",
      };
    case "caution":
      return {
        label: "Caution",
        emoji: "\u{1F7E1}",
        color: "#ca8a04",
        bgClass: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900",
        textClass: "text-yellow-700 dark:text-yellow-400",
        badgeClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
        ringClass: "stroke-yellow-500",
      };
    case "high_risk":
      return {
        label: "High Risk",
        emoji: "\u{1F534}",
        color: "#dc2626",
        bgClass: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900",
        textClass: "text-red-700 dark:text-red-400",
        badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
        ringClass: "stroke-red-500",
      };
  }
}

// --- Health Score Helpers (kept for backward compat) ---

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#65a30d";
  if (score >= 40) return "#ca8a04";
  if (score >= 20) return "#ea580c";
  return "#dc2626";
}

export function getHealthScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-600";
  if (score >= 60) return "bg-lime-600";
  if (score >= 40) return "bg-yellow-600";
  if (score >= 20) return "bg-orange-600";
  return "bg-red-600";
}

export function getHealthScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Poor";
  return "Very Poor";
}

// --- Health Tag Label Map ---

const HEALTH_TAG_LABELS: Record<HealthTag, string> = {
  pre_diabetes: "Pre-Diabetes",
  pcos: "PCOS",
  high_blood_pressure: "High Blood Pressure",
  keto: "Keto",
  vegan: "Vegan",
  eczema: "Eczema",
  acne_prone: "Acne-Prone",
  sulfate_free: "Sulfate-Free",
  paraben_free: "Paraben-Free",
  gluten_free: "Gluten-Free",
  lactose_free: "Lactose-Free",
  peanut_free: "Peanut-Free",
  soy_free: "Soy-Free",
  shellfish_free: "Shellfish-Free",
  sensitive_dog: "Sensitive Dog",
  cat_toxic_avoid: "Cat Toxic Avoidance",
};

export function getHealthTagLabel(tag: HealthTag): string {
  return HEALTH_TAG_LABELS[tag] || tag;
}

// --- Flagged Ingredient Helpers ---

export function getFlaggedIngredientColor(severity: FlaggedIngredient["severity"]): string {
  switch (severity) {
    case "high":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900";
    case "low":
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900";
  }
}
