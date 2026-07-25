import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { getRedis } from "@/lib/redis";

const OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org/api/v2/product";

// --- Local Health Analysis Engine (no API needed) ---

const POSITIVE_KEYWORDS: Record<string, string> = {
  "whole grain": "Contains whole grains for better digestion",
  "oat": "Good source of fiber from oats",
  "fiber": "Provides dietary fiber",
  "protein": "Good source of protein",
  "vitamin": "Contains added vitamins",
  "mineral": "Contains essential minerals",
  "iron": "Good source of iron",
  "calcium": "Provides calcium for bone health",
  "omega": "Contains omega fatty acids",
  "antioxidant": "Contains antioxidants",
  "fruit": "Contains real fruit",
  "vegetable": "Contains vegetables",
  "nut": "Contains nuts with healthy fats",
  "honey": "Sweetened with natural honey",
  "olive oil": "Made with heart-healthy olive oil",
  "organic": "Made with organic ingredients",
  "wholemeal": "Made with wholemeal flour",
  "natural": "Uses natural flavourings",
};

const NEGATIVE_KEYWORDS: Record<string, { reason: string; severity: number }> = {
  "high fructose corn syrup": { reason: "Contains high fructose corn syrup — linked to obesity and diabetes", severity: 3 },
  "aspartame": { reason: "Contains aspartame — controversial artificial sweetener", severity: 2 },
  "msg": { reason: "Contains MSG — may cause headaches in sensitive people", severity: 1 },
  "trans fat": { reason: "Contains trans fats — harmful to heart health", severity: 3 },
  "hydrogenated": { reason: "Contains hydrogenated oils — may contain trans fats", severity: 2 },
  "palm oil": { reason: "Contains palm oil — high in saturated fat", severity: 2 },
  "sodium nitrite": { reason: "Contains sodium nitrite — preservative linked to health concerns", severity: 2 },
  "bha": { reason: "Contains BHA — controversial preservative", severity: 2 },
  "bht": { reason: "Contains BHT — controversial preservative", severity: 1 },
  "artificial colour": { reason: "Contains artificial colours — may affect children's behaviour", severity: 2 },
  "artificial flavor": { reason: "Contains artificial flavours", severity: 1 },
  "sugar": { reason: "Contains added sugar", severity: 1 },
  "syrup": { reason: "Contains sugar syrups", severity: 1 },
  "sodium": { reason: "High sodium content", severity: 1 },
  "saturated fat": { reason: "High in saturated fat", severity: 2 },
  "caffeine": { reason: "Contains caffeine", severity: 1 },
  "sulphite": { reason: "Contains sulphites — may cause reactions in asthmatics", severity: 1 },
  "colour (caramel": { reason: "Contains caramel colouring", severity: 1 },
  "phosphoric acid": { reason: "Contains phosphoric acid — can affect bone health", severity: 1 },
};

function analyzeIngredients(ingredientsText: string): {
  healthScore: number;
  analysis: string;
  summaryPoints: string[];
  alertMessage: string | null;
  pros: string[];
  cons: string[];
} {
  const text = ingredientsText.toLowerCase();
  const ingredients = ingredientsText.split(",").map((s) => s.trim()).filter(Boolean);

  let score = 60; // start neutral
  const pros: string[] = [];
  const cons: string[] = [];
  let alertMessage: string | null = null;
  const alertIssues: string[] = [];

  // Check positive keywords
  for (const [keyword, reason] of Object.entries(POSITIVE_KEYWORDS)) {
    if (text.includes(keyword)) {
      score += 5;
      pros.push(reason);
    }
  }

  // Check negative keywords
  for (const [keyword, info] of Object.entries(NEGATIVE_KEYWORDS)) {
    if (text.includes(keyword)) {
      score -= info.severity * 4;
      cons.push(info.reason);
      if (info.severity >= 3) alertIssues.push(info.reason);
    }
  }

  // Ingredient count analysis
  if (ingredients.length > 15) {
    score -= 10;
    cons.push(`Highly processed with ${ingredients.length} ingredients`);
  } else if (ingredients.length <= 5) {
    score += 10;
    pros.push(`Simple recipe with only ${ingredients.length} ingredients`);
  }

  // Sugar check - look for sugar in first few ingredients
  const firstThree = ingredients.slice(0, 3).join(", ").toLowerCase();
  if (firstThree.includes("sugar") || firstThree.includes("sucre")) {
    score -= 15;
    cons.push("Sugar is one of the main ingredients");
  }

  // Water as first ingredient (beverages)
  if (firstThree.includes("water") || firstThree.includes("eau")) {
    score += 5;
  }

  // Additives count
  const additivePatterns = /e\d{3,4}/gi;
  const additives = ingredientsText.match(additivePatterns) || [];
  if (additives.length > 3) {
    score -= 8;
    cons.push(`Contains ${additives.length} food additives (${additives.slice(0, 5).join(", ")})`);
  }

  // Clamp score
  score = Math.min(100, Math.max(5, score));

  // Build analysis text
  let analysis = "";
  if (score >= 80) {
    analysis = `This is a relatively healthy product with a score of ${score}/100. ${pros[0] || "It has a simple ingredient list."}`;
  } else if (score >= 60) {
    analysis = `This product has moderate nutritional value (${score}/100). ${pros[0] || ""} ${cons[0] ? "However, " + cons[0].toLowerCase() + "." : ""}`;
  } else if (score >= 40) {
    analysis = `This product has below-average nutritional value (${score}/100). ${cons[0] || "It contains several processed ingredients."} ${pros[0] || ""}`;
  } else {
    analysis = `This product has poor nutritional quality (${score}/100). ${cons[0] || "It is highly processed with concerning ingredients."} Consider healthier alternatives.`;
  }

  // Build summary points
  const summaryPoints: string[] = [];
  summaryPoints.push(`Health Score: ${score}/100 — ${score >= 70 ? "Good" : score >= 50 ? "Moderate" : score >= 30 ? "Below Average" : "Poor"}`);
  if (ingredients.length > 0) {
    summaryPoints.push(`Contains ${ingredients.length} ingredient${ingredients.length > 1 ? "s" : ""}`);
  }
  if (pros.length > 0) summaryPoints.push(`Pros: ${pros.slice(0, 2).join("; ")}`);
  if (cons.length > 0) summaryPoints.push(`Cons: ${cons.slice(0, 2).join("; ")}`);

  // Alert
  if (alertIssues.length > 0) {
    alertMessage = `Warning: ${alertIssues.join(". ")}`;
  }

  return { healthScore: score, analysis, summaryPoints, alertMessage, pros, cons };
}

// --- API Route ---

async function fetchFromOpenFoodFacts(barcode: string) {
  const res = await fetch(`${OPEN_FOOD_FACTS_URL}/${barcode}.json`);
  if (!res.ok) throw new Error("Failed to fetch from Open Food Facts");
  return res.json();
}

async function analyzeWithAI(productName: string, ingredientsText: string) {
  const apiKey = process.env.NARA_API_KEY;
  if (!apiKey) throw new Error("NARA_API_KEY not configured");

  const prompt = `You are a nutrition expert. Analyze this food product and return ONLY a JSON object (no markdown, no code blocks):

{
  "healthScore": <number 1-100>,
  "analysis": "<2-3 sentences about the product's healthiness>",
  "pros": ["<pro 1>", "<pro 2>", "<pro 3>"],
  "cons": ["<con 1>", "<con 2>", "<con 3>"],
  "summaryPoints": ["<point 1>", "<point 2>", "<point 3>"],
  "alertMessage": "<health warning string or null>"
}

Product: ${productName}
Ingredients: ${ingredientsText || "Not available"}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://router.bynara.id/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "glm-5.2-alibaba",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) throw new Error(`NaraRouter ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No AI response content");

    let jsonStr = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const parsed = JSON.parse(jsonStr);
    return {
      healthScore: Math.min(100, Math.max(1, Number(parsed.healthScore) || 50)),
      analysis: String(parsed.analysis || ""),
      pros: Array.isArray(parsed.pros) ? parsed.pros.map(String) : [],
      cons: Array.isArray(parsed.cons) ? parsed.cons.map(String) : [],
      summaryPoints: Array.isArray(parsed.summaryPoints) ? parsed.summaryPoints.map(String) : [],
      alertMessage: parsed.alertMessage ? String(parsed.alertMessage) : undefined,
    };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function analyzeWithGemini(productName: string, ingredientsText: string) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const prompt = `You are a nutrition expert. Analyze this food product and return ONLY a JSON object (no markdown, no code blocks):

{
  "healthScore": <number 1-100>,
  "analysis": "<2-3 sentences about the product's healthiness>",
  "pros": ["<pro 1>", "<pro 2>", "<pro 3>"],
  "cons": ["<con 1>", "<con 2>", "<con 3>"],
  "summaryPoints": ["<point 1>", "<point 2>", "<point 3>"],
  "alertMessage": "<health warning string or null>"
}

Product: ${productName}
Ingredients: ${ingredientsText || "Not available"}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Gemini ${response.status}`);

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("No Gemini response content");

    let jsonStr = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const parsed = JSON.parse(jsonStr);
    return {
      healthScore: Math.min(100, Math.max(1, Number(parsed.healthScore) || 50)),
      analysis: String(parsed.analysis || ""),
      pros: Array.isArray(parsed.pros) ? parsed.pros.map(String) : [],
      cons: Array.isArray(parsed.cons) ? parsed.cons.map(String) : [],
      summaryPoints: Array.isArray(parsed.summaryPoints) ? parsed.summaryPoints.map(String) : [],
      alertMessage: parsed.alertMessage ? String(parsed.alertMessage) : undefined,
    };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");

  if (!barcode || !/^\d{8,14}$/.test(barcode)) {
    return NextResponse.json(
      { error: "Invalid barcode. Must be 8-14 digits." },
      { status: 400 }
    );
  }

  try {
    // 1. Check Redis cache
    let redis = null;
    try {
      redis = getRedis();
      const cached = await redis.get(`scan:${barcode}`);
      if (cached) return NextResponse.json(cached);
    } catch (e) {
      console.warn("Redis unavailable:", e);
    }

    // 2. Check Supabase
    const supabase = getSupabaseServiceClient();
    const { data: dbProduct } = await supabase
      .from("cached_products")
      .select("*")
      .eq("barcode", barcode)
      .single();

    if (dbProduct) {
      const result = {
        barcode: dbProduct.barcode,
        productName: dbProduct.product_name,
        ingredientsText: dbProduct.ingredients_text || "",
        ingredients: dbProduct.ingredients_text
          ? dbProduct.ingredients_text.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [],
        healthScore: dbProduct.health_score,
        analysis: dbProduct.analysis || "",
        pros: [],
        cons: [],
        summaryPoints: [],
        alertMessage: undefined as string | undefined,
        brand: undefined as string | undefined,
      };

      if (redis) {
        try { await redis.set(`scan:${barcode}`, result, { ex: 86400 }); } catch {}
      }

      return NextResponse.json(result);
    }

    // 3. Fetch from Open Food Facts
    let offData;
    try {
      offData = await fetchFromOpenFoodFacts(barcode);
    } catch (e) {
      console.error("Open Food Facts failed:", e);
      return NextResponse.json(
        { error: "Failed to fetch product data. Please try again." },
        { status: 502 }
      );
    }

    if (offData.status !== 1 || !offData.product) {
      return NextResponse.json(
        { error: "Product not found in Open Food Facts database." },
        { status: 404 }
      );
    }

    const product = offData.product;
    const productName = product.product_name || "Unknown Product";
    const ingredientsText = product.ingredients_text || "";
    const brand = product.brands || undefined;

    // 4. Analysis: try AI, fallback to local engine
    let aiResult;
    try {
      aiResult = await analyzeWithAI(productName, ingredientsText);
    } catch (naraErr) {
      console.warn("NaraRouter failed:", naraErr);
      try {
        aiResult = await analyzeWithGemini(productName, ingredientsText);
      } catch (geminiErr) {
        console.warn("Gemini failed, using local analysis:", geminiErr);
        aiResult = analyzeIngredients(ingredientsText);
      }
    }

    const result = {
      barcode,
      productName,
      ingredientsText,
      ingredients: ingredientsText
        ? ingredientsText.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      healthScore: aiResult.healthScore,
      analysis: aiResult.analysis,
      pros: aiResult.pros || [],
      cons: aiResult.cons || [],
      summaryPoints: aiResult.summaryPoints || [],
      alertMessage: aiResult.alertMessage,
      brand,
    };

    // 5. Cache
    if (redis) {
      try { await redis.set(`scan:${barcode}`, result, { ex: 86400 }); } catch {}
    }
    try {
      await supabase.from("cached_products").upsert(
        {
          barcode,
          product_name: productName,
          ingredients_text: ingredientsText,
          analysis: aiResult.analysis,
          health_score: aiResult.healthScore,
        },
        { onConflict: "barcode" }
      );
    } catch {}

    return NextResponse.json(result);
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
