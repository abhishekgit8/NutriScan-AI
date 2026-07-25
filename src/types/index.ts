export interface ScanResult {
  barcode: string;
  productName: string;
  ingredientsText: string;
  ingredients: string[];
  healthScore: number;
  analysis: string;
  pros: string[];
  cons: string[];
  summaryPoints: string[];
  alertMessage?: string;
  imageUrl?: string;
  brand?: string;
}

export interface UserProfile {
  id: string;
  clerkUserId: string;
  email: string;
  displayName?: string;
  preferences: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScanHistoryItem {
  id: string;
  barcode: string;
  productName: string;
  healthScore: number;
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

export interface AIAnalysisResponse {
  healthScore: number;
  analysis: string;
  summaryPoints: string[];
  alertMessage?: string;
}
