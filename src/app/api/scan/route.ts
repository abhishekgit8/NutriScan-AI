import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { getRedis } from "@/lib/redis";
import { RiskTier, HealthTag, FlaggedIngredient } from "@/types";
import { getRiskTierFromScore } from "@/lib/utils";

const OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org/api/v2/product";

// --- Health Tag to Ingredient Conflict Map ---

const TAG_CONFLICTS: Record<HealthTag, { keywords: string[]; reason: string }[]> = {
  pre_diabetes: [
    { keywords: ["sugar", "sucre", "high fructose corn syrup", "glucose-fructose", "dextrose", "maltodextrin"], reason: "Contains sugar or high-GI sweeteners" },
    { keywords: ["white flour", "refined flour", "enriched flour"], reason: "Refined flour spikes blood sugar" },
  ],
  pcos: [
    { keywords: ["sugar", "sucre", "high fructose corn syrup"], reason: "High sugar can worsen PCOS symptoms" },
    { keywords: ["soy"], reason: "Soy may affect hormone balance in PCOS" },
  ],
  high_blood_pressure: [
    { keywords: ["sodium", "salt", "nacl", "monosodium"], reason: "High sodium content" },
    { keywords: ["msg", "monosodium glutamate"], reason: "MSG contributes to sodium intake" },
  ],
  keto: [
    { keywords: ["sugar", "sucre", "high fructose corn syrup", "glucose-fructose", "dextrose", "maltodextrin"], reason: "Contains sugar — not keto-friendly" },
    { keywords: ["wheat", "flour", "corn starch", "potato starch"], reason: "Contains high-carb ingredients" },
    { keywords: ["palm oil"], reason: "Palm oil is high in saturated fat" },
  ],
  vegan: [
    { keywords: ["milk", "lait", "whey", "casein", "lactose"], reason: "Contains dairy derivatives" },
    { keywords: ["egg", "oeuf", "albumin", "globulin"], reason: "Contains egg derivatives" },
    { keywords: ["honey", "miel"], reason: "Honey is not vegan" },
    { keywords: ["gelatin", "gélatine"], reason: "Contains gelatin (animal-derived)" },
  ],
  eczema: [
    { keywords: ["artificial colour", "artificial color", "food dye", "tartrazine", "allura red"], reason: "Artificial colours can trigger eczema flare-ups" },
    { keywords: ["gluten", "wheat"], reason: "Gluten may trigger skin inflammation" },
    { keywords: ["soy"], reason: "Soy can trigger inflammatory responses" },
  ],
  acne_prone: [
    { keywords: ["whey", "milk", "lait"], reason: "Dairy/whey is linked to acne breakouts" },
    { keywords: ["sugar", "sucre", "high fructose corn syrup"], reason: "High sugar triggers acne-causing hormones" },
    { keywords: ["soy"], reason: "Soy can affect hormonal balance" },
  ],
  sulfate_free: [
    { keywords: ["sodium lauryl sulfate", "sodium laureth sulfate", "sls", "sles", "sulfate"], reason: "Contains sulfates — harsh surfactants" },
  ],
  paraben_free: [
    { keywords: ["paraben", "methylparaben", "propylparaben", "butylparaben"], reason: "Contains parabens — preservative with health concerns" },
  ],
  gluten_free: [
    { keywords: ["wheat", "barley", "rye", "malt", "gluten", "semolina", "spelt", "kamut"], reason: "Contains gluten-containing grains" },
  ],
  lactose_free: [
    { keywords: ["milk", "lait", "whey", "casein", "lactose", "cream", "butter", "cheese"], reason: "Contains lactose or dairy derivatives" },
  ],
  peanut_free: [
    { keywords: ["peanut", "arachide", "groundnut"], reason: "Contains peanuts" },
  ],
  soy_free: [
    { keywords: ["soy", "soja", "soybean", "lecithin (soy)"], reason: "Contains soy derivatives" },
  ],
  shellfish_free: [
    { keywords: ["shrimp", "crab", "lobster", "crayfish", "prawn"], reason: "Contains shellfish derivatives" },
  ],
  sensitive_dog: [
    { keywords: ["artificial preservative", "bha", "bht", "ethoxyquin"], reason: "Artificial preservatives can upset sensitive dogs" },
    { keywords: ["corn syrup", "high fructose corn syrup"], reason: "Corn syrup is a filler with low nutritional value" },
  ],
  cat_toxic_avoid: [
    { keywords: ["onion", "garlic", "chives", "leek"], reason: "Onion/garlic family is toxic to cats" },
    { keywords: ["chocolate", "cocoa", "theobromine"], reason: "Chocolate is toxic to cats" },
    { keywords: ["grape", "raisin"], reason: "Grapes are toxic to cats" },
    { keywords: ["xylitol"], reason: "Xylitol is toxic to cats" },
  ],
};

// --- Local Health Analysis Engine ---

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

function analyzeIngredients(
  ingredientsText: string,
  activeTags: HealthTag[] = []
): {
  healthScore: number;
  riskTier: RiskTier;
  analysis: string;
  summaryPoints: string[];
  alertMessage: string | undefined;
  pros: string[];
  cons: string[];
  flaggedIngredients: FlaggedIngredient[];
} {
  const text = ingredientsText.toLowerCase();
  const ingredients = ingredientsText.split(",").map((s) => s.trim()).filter(Boolean);

  let score = 60;
  const pros: string[] = [];
  const cons: string[] = [];
  let alertMessage: string | undefined;
  const alertIssues: string[] = [];
  const flaggedIngredients: FlaggedIngredient[] = [];

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

  // Health tag conflict analysis
  if (activeTags.length > 0) {
    for (const tag of activeTags) {
      const conflicts = TAG_CONFLICTS[tag] || [];
      for (const conflict of conflicts) {
        for (const keyword of conflict.keywords) {
          if (text.includes(keyword)) {
            score -= 15;
            flaggedIngredients.push({
              name: keyword,
              reason: conflict.reason,
              severity: "high",
            });
            cons.push(`[${tag.toUpperCase()}] ${conflict.reason}`);
            alertIssues.push(conflict.reason);
            break;
          }
        }
      }
    }
  }

  // Deduplicate flagged ingredients
  const seenFlags = new Set<string>();
  const uniqueFlags = flaggedIngredients.filter((f) => {
    if (seenFlags.has(f.name)) return false;
    seenFlags.add(f.name);
    return true;
  });

  // Clamp score
  score = Math.min(100, Math.max(5, score));

  // Determine risk tier
  const riskTier = getRiskTierFromScore(score, uniqueFlags.length);

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

  if (activeTags.length > 0 && uniqueFlags.length > 0) {
    analysis += ` Based on your health profile (${activeTags.length} active filter${activeTags.length > 1 ? "s" : ""}), ${uniqueFlags.length} ingredient${uniqueFlags.length > 1 ? "s were" : " was"} flagged.`;
  }

  // Build summary points
  const summaryPoints: string[] = [];
  summaryPoints.push(`Health Score: ${score}/100 — ${riskTier === "safe" ? "Safe" : riskTier === "caution" ? "Caution" : "High Risk"}`);
  if (ingredients.length > 0) {
    summaryPoints.push(`Contains ${ingredients.length} ingredient${ingredients.length > 1 ? "s" : ""}`);
  }
  if (pros.length > 0) summaryPoints.push(`Pros: ${pros.slice(0, 2).join("; ")}`);
  if (cons.length > 0) summaryPoints.push(`Cons: ${cons.slice(0, 2).join("; ")}`);
  if (uniqueFlags.length > 0) {
    summaryPoints.push(`Flagged: ${uniqueFlags.map((f) => f.name).join(", ")}`);
  }

  // Alert
  if (alertIssues.length > 0) {
    alertMessage = `Warning: ${alertIssues.slice(0, 3).join(". ")}`;
  }

  return { healthScore: score, riskTier, analysis, summaryPoints, alertMessage, pros, cons, flaggedIngredients: uniqueFlags };
}

// --- API Route ---

async function fetchFromOpenFoodFacts(barcode: string) {
  const res = await fetch(`${OPEN_FOOD_FACTS_URL}/${barcode}.json`);
  if (!res.ok) throw new Error("Failed to fetch from Open Food Facts");
  return res.json();
}

// --- Generic OpenAI-Compatible API Caller ---

interface OpenAIProvider {
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
}

function buildAnalysisPrompt(productName: string, ingredientsText: string, tagContext: string): string {
  return `You are a nutrition expert. Analyze this food product and return ONLY a JSON object (no markdown, no code blocks):

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

Product: ${productName}
Ingredients: ${ingredientsText || "Not available"}${tagContext}`;
}

async function callOpenAICompatible(
  provider: OpenAIProvider,
  prompt: string
): Promise<{
  healthScore: number;
  riskTier: RiskTier;
  analysis: string;
  pros: string[];
  cons: string[];
  summaryPoints: string[];
  flaggedIngredients: FlaggedIngredient[];
  alertMessage?: string;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) throw new Error(`${provider.name} ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error(`No response from ${provider.name}`);

    let jsonStr = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const parsed = JSON.parse(jsonStr);
    return {
      healthScore: Math.min(100, Math.max(1, Number(parsed.healthScore) || 50)),
      riskTier: (["safe", "caution", "high_risk"].includes(parsed.riskTier) ? parsed.riskTier : "caution") as RiskTier,
      analysis: String(parsed.analysis || ""),
      pros: Array.isArray(parsed.pros) ? parsed.pros.map(String) : [],
      cons: Array.isArray(parsed.cons) ? parsed.cons.map(String) : [],
      summaryPoints: Array.isArray(parsed.summaryPoints) ? parsed.summaryPoints.map(String) : [],
      flaggedIngredients: Array.isArray(parsed.flaggedIngredients)
        ? parsed.flaggedIngredients.map((f: Record<string, string>) => ({
            name: String(f.name || ""),
            reason: String(f.reason || ""),
            severity: (["low", "medium", "high"].includes(f.severity) ? f.severity : "low") as "low" | "medium" | "high",
          }))
        : [],
      alertMessage: parsed.alertMessage ? String(parsed.alertMessage) : undefined,
    };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

function getTagContext(activeTags: HealthTag[]): string {
  return activeTags.length > 0
    ? `\nUser Health Profile: ${activeTags.join(", ")}\nFlag ingredients that conflict with these health conditions.`
    : "";
}

// --- Provider Configs ---

function getNaraRouter(): OpenAIProvider | null {
  const key = process.env.NARA_API_KEY;
  if (!key) return null;
  return { name: "NaraRouter", baseUrl: "https://router.bynara.id/v1", model: "agnes-2.5-flash", apiKey: key };
}

function getOpenRouter(): OpenAIProvider | null {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  return { name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", model: "google/gemma-4-31b-it:free", apiKey: key };
}

function getGroq(): OpenAIProvider | null {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  return { name: "Groq", baseUrl: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile", apiKey: key };
}

// --- AI Analysis with Full Fallback Chain ---

async function analyzeWithAIChain(
  productName: string,
  ingredientsText: string,
  activeTags: HealthTag[]
): Promise<{
  healthScore: number;
  riskTier: RiskTier;
  analysis: string;
  pros: string[];
  cons: string[];
  summaryPoints: string[];
  flaggedIngredients: FlaggedIngredient[];
  alertMessage?: string;
}> {
  const tagContext = getTagContext(activeTags);
  const prompt = buildAnalysisPrompt(productName, ingredientsText, tagContext);

  // 1. NaraRouter (primary)
  const nara = getNaraRouter();
  if (nara) {
    try {
      const result = await callOpenAICompatible(nara, prompt);
      console.log(`NaraRouter OK: score=${result.healthScore}`);
      return result;
    } catch (err) {
      console.warn("NaraRouter failed:", err);
    }
  }

  // 2. OpenRouter (fallback)
  const openrouter = getOpenRouter();
  if (openrouter) {
    try {
      const result = await callOpenAICompatible(openrouter, prompt);
      console.log(`OpenRouter OK: score=${result.healthScore}`);
      return result;
    } catch (err) {
      console.warn("OpenRouter failed:", err);
    }
  }

  // 3. Groq (text-only fallback)
  const groq = getGroq();
  if (groq) {
    try {
      const result = await callOpenAICompatible(groq, prompt);
      console.log(`Groq OK: score=${result.healthScore}`);
      return result;
    } catch (err) {
      console.warn("Groq failed:", err);
    }
  }

  // 4. Gemini (Google fallback)
  try {
    const result = await analyzeWithGemini(productName, ingredientsText, activeTags);
    console.log(`Gemini OK: score=${result.healthScore}`);
    return result;
  } catch (err) {
    console.warn("Gemini failed:", err);
  }

  // 5. Local engine (final fallback)
  console.log("All AI providers failed, using local analysis");
  return analyzeIngredients(ingredientsText, activeTags);
}

async function analyzeWithGemini(productName: string, ingredientsText: string, activeTags: HealthTag[]) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const tagContext = getTagContext(activeTags);
  const prompt = buildAnalysisPrompt(productName, ingredientsText, tagContext);

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
      riskTier: (["safe", "caution", "high_risk"].includes(parsed.riskTier) ? parsed.riskTier : "caution") as RiskTier,
      analysis: String(parsed.analysis || ""),
      pros: Array.isArray(parsed.pros) ? parsed.pros.map(String) : [],
      cons: Array.isArray(parsed.cons) ? parsed.cons.map(String) : [],
      summaryPoints: Array.isArray(parsed.summaryPoints) ? parsed.summaryPoints.map(String) : [],
      flaggedIngredients: Array.isArray(parsed.flaggedIngredients)
        ? parsed.flaggedIngredients.map((f: Record<string, string>) => ({
            name: String(f.name || ""),
            reason: String(f.reason || ""),
            severity: (["low", "medium", "high"].includes(f.severity) ? f.severity : "low") as "low" | "medium" | "high",
          }))
        : [],
      alertMessage: parsed.alertMessage ? String(parsed.alertMessage) : undefined,
    };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

function parseIngredients(raw: string): string[] {
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  const tagsParam = request.nextUrl.searchParams.get("tags");
  const manualIngredients = request.nextUrl.searchParams.get("ingredients");

  // Parse health tags from query
  const activeTags: HealthTag[] = tagsParam
    ? (tagsParam.split(",").filter(Boolean) as HealthTag[])
    : [];

  // Manual ingredient text mode (no barcode needed)
  if (manualIngredients && manualIngredients.trim().length > 3) {
    const aiResult = analyzeIngredients(manualIngredients, activeTags);
    return NextResponse.json({
      barcode: "manual",
      productName: "Manual Entry",
      ingredientsText: manualIngredients,
      ingredients: parseIngredients(manualIngredients),
      healthScore: aiResult.healthScore,
      riskTier: aiResult.riskTier,
      analysis: aiResult.analysis,
      pros: aiResult.pros,
      cons: aiResult.cons,
      summaryPoints: aiResult.summaryPoints,
      flaggedIngredients: aiResult.flaggedIngredients,
      alertMessage: aiResult.alertMessage,
    });
  }

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
      const cacheKey = activeTags.length > 0
        ? `scan:${barcode}:tags:${activeTags.sort().join(",")}`
        : `scan:${barcode}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        const cachedAnalysis = (cached as Record<string, unknown>).analysis as string | undefined;
        const hasValidAnalysis = cachedAnalysis &&
          !cachedAnalysis.includes("Unable to generate") &&
          !cachedAnalysis.includes("try again") &&
          cachedAnalysis.length > 20;
        if (hasValidAnalysis) return NextResponse.json(cached);
        try { await redis.del(cacheKey); } catch {}
      }
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
      const hasValidAnalysis = dbProduct.analysis &&
        !dbProduct.analysis.includes("Unable to generate") &&
        !dbProduct.analysis.includes("try again") &&
        dbProduct.analysis.length > 20;

      if (hasValidAnalysis && activeTags.length === 0) {
        const result = {
          barcode: dbProduct.barcode,
          productName: dbProduct.product_name,
          ingredientsText: dbProduct.ingredients_text || "",
          ingredients: parseIngredients(dbProduct.ingredients_text || ""),
          healthScore: dbProduct.health_score,
          riskTier: (dbProduct.riskTier || "caution") as RiskTier,
          analysis: dbProduct.analysis || "",
          pros: [] as string[],
          cons: [] as string[],
          summaryPoints: [] as string[],
          flaggedIngredients: [] as FlaggedIngredient[],
          alertMessage: undefined as string | undefined,
          brand: undefined as string | undefined,
        };
        if (redis) {
          try { await redis.set(`scan:${barcode}`, result, { ex: 86400 }); } catch {}
        }
        return NextResponse.json(result);
      }

      // Re-analyze with health tags
      const productName = dbProduct.product_name;
      const ingredientsText = dbProduct.ingredients_text || "";
      console.log(`Re-analyzing product with tags: ${productName} [${activeTags.join(",")}]`);

      let reAnalysis;
      try {
        reAnalysis = await analyzeWithAIChain(productName, ingredientsText, activeTags);
      } catch {
        reAnalysis = analyzeIngredients(ingredientsText, activeTags);
      }

      const result = {
        barcode,
        productName,
        ingredientsText,
        ingredients: parseIngredients(ingredientsText),
        healthScore: reAnalysis.healthScore,
        riskTier: reAnalysis.riskTier,
        analysis: reAnalysis.analysis,
        pros: reAnalysis.pros || [],
        cons: reAnalysis.cons || [],
        summaryPoints: reAnalysis.summaryPoints || [],
        flaggedIngredients: reAnalysis.flaggedIngredients || [],
        alertMessage: reAnalysis.alertMessage,
        brand: dbProduct.product_name,
      };

      try {
        await supabase.from("cached_products").update({
          analysis: reAnalysis.analysis,
          health_score: reAnalysis.healthScore,
          risk_tier: reAnalysis.riskTier,
        }).eq("barcode", barcode);
      } catch {}

      const cacheKey = activeTags.length > 0
        ? `scan:${barcode}:tags:${activeTags.sort().join(",")}`
        : `scan:${barcode}`;
      if (redis) {
        try { await redis.set(cacheKey, result, { ex: 86400 }); } catch {}
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
      aiResult = await analyzeWithAIChain(productName, ingredientsText, activeTags);
    } catch {
      aiResult = analyzeIngredients(ingredientsText, activeTags);
    }

    const result = {
      barcode,
      productName,
      ingredientsText,
      ingredients: parseIngredients(ingredientsText),
      healthScore: aiResult.healthScore,
      riskTier: aiResult.riskTier,
      analysis: aiResult.analysis,
      pros: aiResult.pros || [],
      cons: aiResult.cons || [],
      summaryPoints: aiResult.summaryPoints || [],
      flaggedIngredients: aiResult.flaggedIngredients || [],
      alertMessage: aiResult.alertMessage,
      brand,
    };

    // 5. Cache
    const cacheKey = activeTags.length > 0
      ? `scan:${barcode}:tags:${activeTags.sort().join(",")}`
      : `scan:${barcode}`;
    if (redis) {
      try { await redis.set(cacheKey, result, { ex: 86400 }); } catch {}
    }
    try {
      await supabase.from("cached_products").upsert(
        {
          barcode,
          product_name: productName,
          ingredients_text: ingredientsText,
          analysis: aiResult.analysis,
          health_score: aiResult.healthScore,
          risk_tier: aiResult.riskTier,
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
