export type RiskTier = "safe" | "caution" | "high_risk";

export type HealthTag =
  // Metabolic & Dietary
  | "pre_diabetes"
  | "pcos"
  | "high_blood_pressure"
  | "keto"
  | "vegan"
  // Skin & Beauty
  | "eczema"
  | "acne_prone"
  | "sulfate_free"
  | "paraben_free"
  // Allergens
  | "gluten_free"
  | "lactose_free"
  | "peanut_free"
  | "soy_free"
  | "shellfish_free"
  // Pets
  | "sensitive_dog"
  | "cat_toxic_avoid";

export const HEALTH_TAG_GROUPS: Record<string, { tag: HealthTag; label: string }[]> = {
  "Metabolic & Dietary": [
    { tag: "pre_diabetes", label: "Pre-Diabetes" },
    { tag: "pcos", label: "PCOS" },
    { tag: "high_blood_pressure", label: "High Blood Pressure" },
    { tag: "keto", label: "Keto" },
    { tag: "vegan", label: "Vegan" },
  ],
  "Skin & Beauty": [
    { tag: "eczema", label: "Eczema" },
    { tag: "acne_prone", label: "Acne-Prone" },
    { tag: "sulfate_free", label: "Sulfate-Free" },
    { tag: "paraben_free", label: "Paraben-Free" },
  ],
  Allergens: [
    { tag: "gluten_free", label: "Gluten" },
    { tag: "lactose_free", label: "Lactose" },
    { tag: "peanut_free", label: "Peanuts" },
    { tag: "soy_free", label: "Soy" },
    { tag: "shellfish_free", label: "Shellfish" },
  ],
  Pets: [
    { tag: "sensitive_dog", label: "Sensitive Dog" },
    { tag: "cat_toxic_avoid", label: "Cat Toxic Avoidance" },
  ],
};

export const ALL_HEALTH_TAGS: HealthTag[] = Object.values(HEALTH_TAG_GROUPS).flatMap(
  (group) => group.map((item) => item.tag)
);

export interface FlaggedIngredient {
  name: string;
  reason: string;
  severity: "low" | "medium" | "high";
}

export interface ScanResult {
  barcode: string;
  productName: string;
  ingredientsText: string;
  ingredients: string[];
  healthScore: number;
  riskTier: RiskTier;
  analysis: string;
  pros: string[];
  cons: string[];
  summaryPoints: string[];
  flaggedIngredients: FlaggedIngredient[];
  alertMessage?: string;
  imageUrl?: string;
  brand?: string;
  category?: string;
}

export interface UserProfile {
  id: string;
  clerkUserId: string;
  email: string;
  displayName?: string;
  preferences: string[];
  healthTags: HealthTag[];
  createdAt: string;
  updatedAt: string;
}

export interface ScanHistoryItem {
  id: string;
  barcode: string;
  productName: string;
  healthScore: number;
  riskTier: RiskTier;
  scannedAt: string;
}

export interface OpenFoodFactsProduct {
  status: number;
  product: {
    product_name: string;
    ingredients_text: string;
    image_url?: string;
    brands?: string;
    barcode: string;
  } | null;
}

export type ImageScanMode = "ingredients" | "food";

export interface AIAnalysisResponse {
  healthScore: number;
  analysis: string;
  summaryPoints: string[];
  alertMessage?: string;
}
