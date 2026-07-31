import { NextRequest, NextResponse } from "next/server";
import { HealthTag, ImageScanMode, RiskTier } from "@/types";
import { getRiskTierFromScore } from "@/lib/utils";

const NARA_API_URL = "https://router.bynara.id/v1/chat/completions";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// --- Prompts ---

function getIngredientsPrompt(): string {
  return `You are a food label reader. Extract ALL ingredient text from this food label photograph.

Rules:
- Return ONLY the ingredients as a comma-separated list
- Preserve the original order
- Include all text you can read, even if partially visible
- Do NOT add analysis, comments, or any other text
- If you cannot read any text, return "UNREADABLE"
- Do not include the product name, brand, or nutrition facts — only the ingredients list`;
}

function getFoodAnalysisPrompt(activeTags: HealthTag[]): string {
  const tagContext = activeTags.length > 0
    ? `\nUser Health Profile: ${activeTags.join(", ")}\nFlag ingredients that conflict with these health conditions.`
    : "";

  return `You are a nutrition expert. Analyze this food image and return ONLY a JSON object (no markdown, no code blocks):

{
  "productName": "<estimated name of the food>",
  "brand": null,
  "category": "<Food|Beverage|Snack|Dessert|Meal|Produce>",
  "healthScore": <number 1-100>,
  "riskTier": "<safe|caution|high_risk>",
  "analysis": "<2-3 sentences about the food's healthiness>",
  "pros": ["<pro 1>", "<pro 2>", "<pro 3>"],
  "cons": ["<con 1>", "<con 2>", "<con 3>"],
  "ingredients": ["<estimated ingredient 1>", "<estimated ingredient 2>"],
  "flaggedIngredients": [{"name": "<ingredient>", "reason": "<why>", "severity": "<low|medium|high>"}],
  "summaryPoints": ["<point 1>", "<point 2>", "<point 3>"],
  "alertMessage": "<health warning string or null>"
}

Rules:
- Identify the food based on visual appearance
- Estimate ingredients based on what you see
- Be conservative with health scores — when in doubt, score lower
- Consider cooking methods (fried = worse, steamed = better)
- If you see obvious unhealthy ingredients (deep fried, sugary glaze, etc.), score accordingly${tagContext}`;
}

function parseAnalysisJSON(content: string): Record<string, unknown> {
  let jsonStr = content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) jsonStr = jsonMatch[0];
  return JSON.parse(jsonStr);
}

// --- NaraRouter Vision ---

async function callNaraRouterVision(
  base64Image: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.NARA_API_KEY;
  if (!apiKey) throw new Error("NARA_API_KEY not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(NARA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "agnes-2.0-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: base64Image },
              },
            ],
          },
        ],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`NaraRouter ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No response content from NaraRouter");
    return content;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// --- Gemini Vision (Fallback) ---

async function callGeminiVision(
  base64Image: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image.split(",")[1] || base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.3 },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("No response content from Gemini");
    return content;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// --- Ingredients Mode Handler ---

async function handleIngredientsMode(
  base64Image: string,
  activeTags: HealthTag[]
): Promise<unknown> {
  let extractedText: string;

  try {
    extractedText = await callNaraRouterVision(base64Image, getIngredientsPrompt());
  } catch (naraErr) {
    console.warn("NaraRouter vision failed for ingredients:", naraErr);
    try {
      extractedText = await callGeminiVision(base64Image, getIngredientsPrompt());
    } catch (geminiErr) {
      console.warn("Gemini vision failed:", geminiErr);
      throw new Error("Could not extract ingredients from image. Please try again or paste ingredients manually.");
    }
  }

  extractedText = extractedText.trim();

  if (
    extractedText === "UNREADABLE" ||
    extractedText.length < 3 ||
    extractedText.toLowerCase().includes("cannot read")
  ) {
    return {
      barcode: "image",
      productName: "Image Scan",
      ingredientsText: "",
      ingredients: [],
      healthScore: 0,
      riskTier: "caution" as RiskTier,
      analysis: "Could not read the ingredient label clearly. Please try taking a clearer photo or paste the ingredients manually.",
      pros: [],
      cons: [],
      summaryPoints: [],
      flaggedIngredients: [],
      alertMessage: "Label was not readable. Try better lighting or paste ingredients manually.",
    };
  }

  // Analyze extracted ingredients with existing AI pipeline
  const tagContext = activeTags.length > 0
    ? `\nUser Health Profile: ${activeTags.join(", ")}\nFlag ingredients that conflict with these health conditions.`
    : "";

  const analysisPrompt = `You are a nutrition expert. Analyze this food product and return ONLY a JSON object (no markdown, no code blocks):

{
  "healthScore": <number 1-100>,
  "riskTier": "<safe|caution|high_risk>",
  "analysis": "<2-3 sentences about the product's healthiness>",
  "pros": ["<pro 1>", "<pro 2>", "<pro 3>"],
  "cons": ["<con 1>", "<con 2>", "<con 3>"],
  "summaryPoints": ["<point 1>", "<point 2>", "<point 3>"],
  "flaggedIngredients": [{"name": "<ingredient>", "reason": "<why>", "severity": "<low|medium|high>"}],
  "alertMessage": "<health warning string or null>"
}

Product: Scanned from label
Ingredients: ${extractedText}${tagContext}`;

  let analysisContent: string;
  try {
    analysisContent = await callNaraRouterVision(base64Image, analysisPrompt);
  } catch {
    try {
      analysisContent = await callGeminiVision(base64Image, analysisPrompt);
    } catch {
      // Fallback: return extracted text without AI analysis
      const ingredients = extractedText.split(",").map((s: string) => s.trim()).filter(Boolean);
      return {
        barcode: "image",
        productName: "Scanned Label",
        ingredientsText: extractedText,
        ingredients,
        healthScore: 50,
        riskTier: "caution" as RiskTier,
        analysis: `Extracted ${ingredients.length} ingredients from label. AI analysis unavailable.`,
        pros: [],
        cons: [],
        summaryPoints: [`Extracted ${ingredients.length} ingredients`],
        flaggedIngredients: [],
        alertMessage: undefined,
      };
    }
  }

  const parsed = parseAnalysisJSON(analysisContent);
  const ingredients = extractedText.split(",").map((s: string) => s.trim()).filter(Boolean);

  return {
    barcode: "image",
    productName: String(parsed.productName || "Scanned Label"),
    ingredientsText: extractedText,
    ingredients,
    healthScore: Math.min(100, Math.max(1, Number(parsed.healthScore) || 50)),
    riskTier: (["safe", "caution", "high_risk"].includes(parsed.riskTier as string)
      ? parsed.riskTier
      : "caution") as RiskTier,
    analysis: String(parsed.analysis || ""),
    pros: Array.isArray(parsed.pros) ? parsed.pros.map(String) : [],
    cons: Array.isArray(parsed.cons) ? parsed.cons.map(String) : [],
    summaryPoints: Array.isArray(parsed.summaryPoints) ? parsed.summaryPoints.map(String) : [],
    flaggedIngredients: Array.isArray(parsed.flaggedIngredients)
      ? (parsed.flaggedIngredients as Record<string, string>[]).map((f) => ({
          name: String(f.name || ""),
          reason: String(f.reason || ""),
          severity: (["low", "medium", "high"].includes(f.severity) ? f.severity : "low") as "low" | "medium" | "high",
        }))
      : [],
    alertMessage: parsed.alertMessage ? String(parsed.alertMessage) : undefined,
  };
}

// --- Food Mode Handler ---

async function handleFoodMode(
  base64Image: string,
  activeTags: HealthTag[]
): Promise<unknown> {
  let content: string;

  try {
    content = await callNaraRouterVision(base64Image, getFoodAnalysisPrompt(activeTags));
  } catch (naraErr) {
    console.warn("NaraRouter vision failed for food:", naraErr);
    try {
      content = await callGeminiVision(base64Image, getFoodAnalysisPrompt(activeTags));
    } catch (geminiErr) {
      console.warn("Gemini vision failed:", geminiErr);
      throw new Error("Could not analyze food image. Please try again.");
    }
  }

  const parsed = parseAnalysisJSON(content);

  const ingredients = Array.isArray(parsed.ingredients)
    ? (parsed.ingredients as unknown[]).map(String)
    : [];

  return {
    barcode: "image",
    productName: String(parsed.productName || "Unknown Food"),
    brand: parsed.brand ? String(parsed.brand) : undefined,
    category: String(parsed.category || "Food"),
    ingredientsText: ingredients.join(", "),
    ingredients,
    healthScore: Math.min(100, Math.max(1, Number(parsed.healthScore) || 50)),
    riskTier: (["safe", "caution", "high_risk"].includes(parsed.riskTier as string)
      ? parsed.riskTier
      : getRiskTierFromScore(Number(parsed.healthScore) || 50, Array.isArray(parsed.flaggedIngredients) ? parsed.flaggedIngredients.length : 0)) as RiskTier,
    analysis: String(parsed.analysis || ""),
    pros: Array.isArray(parsed.pros) ? parsed.pros.map(String) : [],
    cons: Array.isArray(parsed.cons) ? parsed.cons.map(String) : [],
    summaryPoints: Array.isArray(parsed.summaryPoints) ? parsed.summaryPoints.map(String) : [],
    flaggedIngredients: Array.isArray(parsed.flaggedIngredients)
      ? (parsed.flaggedIngredients as Record<string, string>[]).map((f) => ({
          name: String(f.name || ""),
          reason: String(f.reason || ""),
          severity: (["low", "medium", "high"].includes(f.severity) ? f.severity : "low") as "low" | "medium" | "high",
        }))
      : [],
    alertMessage: parsed.alertMessage ? String(parsed.alertMessage) : undefined,
  };
}

// --- API Route ---

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, mode, tags } = body as {
      image: string;
      mode: ImageScanMode;
      tags: string[];
    };

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    if (!mode || !["ingredients", "food"].includes(mode)) {
      return NextResponse.json(
        { error: "Mode must be 'ingredients' or 'food'" },
        { status: 400 }
      );
    }

    const activeTags: HealthTag[] = Array.isArray(tags)
      ? (tags.filter((t) => typeof t === "string") as HealthTag[])
      : [];

    let result: unknown;

    if (mode === "ingredients") {
      result = await handleIngredientsMode(image, activeTags);
    } else {
      result = await handleFoodMode(image, activeTags);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Image scan error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
