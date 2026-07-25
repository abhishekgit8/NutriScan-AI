import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { getRedis } from "@/lib/redis";

const OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org/api/v2/product";

function getRedisSafe() {
  try {
    return getRedis();
  } catch {
    return null;
  }
}

async function fetchFromOpenFoodFacts(barcode: string) {
  const res = await fetch(`${OPEN_FOOD_FACTS_URL}/${barcode}.json`);
  if (!res.ok) throw new Error("Failed to fetch from Open Food Facts");
  return res.json();
}

async function analyzeWithAI(productName: string, ingredientsText: string) {
  const apiKey = process.env.NARA_API_KEY;
  if (!apiKey) throw new Error("NARA_API_KEY not configured");

  const prompt = `Analyze this food product and return a JSON object with these fields:
- healthScore (number 1-100, where 100 is healthiest)
- analysis (2-3 sentence analysis of the product's healthiness)
- summaryPoints (array of 3-5 key bullet points about the product)
- alertMessage (string or null - any health warning if the product has concerning ingredients like excessive sugar, artificial additives, allergens, etc.)

Product: ${productName}
Ingredients: ${ingredientsText || "Not available"}

Return ONLY valid JSON, no markdown code blocks.`;

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
        model: "glm-5.2-free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error("NaraRouter error:", errText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No AI response content");

    let jsonStr = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const parsed = JSON.parse(jsonStr);
    return {
      healthScore: Math.min(100, Math.max(1, Number(parsed.healthScore) || 50)),
      analysis: String(parsed.analysis || "No analysis available."),
      summaryPoints: Array.isArray(parsed.summaryPoints)
        ? parsed.summaryPoints.map(String)
        : [],
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

  const prompt = `Analyze this food product and return a JSON object with these fields:
- healthScore (number 1-100, where 100 is healthiest)
- analysis (2-3 sentence analysis of the product's healthiness)
- summaryPoints (array of 3-5 key bullet points about the product)
- alertMessage (string or null - any health warning if the product has concerning ingredients like excessive sugar, artificial additives, allergens, etc.)

Product: ${productName}
Ingredients: ${ingredientsText || "Not available"}

Return ONLY valid JSON, no markdown code blocks.`;

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

    if (!response.ok) throw new Error("Gemini analysis failed");

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error("No Gemini response content");

    let jsonStr = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const parsed = JSON.parse(jsonStr);
    return {
      healthScore: Math.min(100, Math.max(1, Number(parsed.healthScore) || 50)),
      analysis: String(parsed.analysis || "No analysis available."),
      summaryPoints: Array.isArray(parsed.summaryPoints)
        ? parsed.summaryPoints.map(String)
        : [],
      alertMessage: parsed.alertMessage ? String(parsed.alertMessage) : undefined,
    };
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

function buildResult(
  barcode: string,
  productName: string,
  ingredientsText: string,
  brand: string | undefined,
  imageUrl: string | undefined,
  aiResult: { healthScore: number; analysis: string; summaryPoints: string[]; alertMessage?: string }
) {
  return {
    barcode,
    productName,
    ingredientsText,
    ingredients: ingredientsText
      ? ingredientsText.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [],
    healthScore: aiResult.healthScore,
    analysis: aiResult.analysis,
    summaryPoints: aiResult.summaryPoints,
    alertMessage: aiResult.alertMessage,
    imageUrl,
    brand,
  };
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
    const redis = getRedisSafe();
    if (redis) {
      try {
        const cached = await redis.get(`scan:${barcode}`);
        if (cached) return NextResponse.json(cached);
      } catch (e) {
        console.warn("Redis read failed:", e);
      }
    }

    // 2. Check Supabase
    const supabase = getSupabaseServiceClient();
    const { data: dbProduct } = await supabase
      .from("cached_products")
      .select("*")
      .eq("barcode", barcode)
      .single();

    if (dbProduct) {
      const result = buildResult(
        dbProduct.barcode,
        dbProduct.product_name,
        dbProduct.ingredients_text || "",
        undefined,
        undefined,
        {
          healthScore: dbProduct.health_score,
          analysis: dbProduct.analysis || "",
          summaryPoints: [],
        }
      );

      if (redis) {
        try {
          await redis.set(`scan:${barcode}`, result, { ex: 86400 });
        } catch (e) {
          console.warn("Redis write failed:", e);
        }
      }

      return NextResponse.json(result);
    }

    // 3. Fetch from Open Food Facts
    let offData;
    try {
      offData = await fetchFromOpenFoodFacts(barcode);
    } catch (e) {
      console.error("Open Food Facts fetch failed:", e);
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
    const imageUrl = product.image_url || undefined;

    // 4. AI Analysis - try NaraRouter, fallback to Gemini
    let aiResult;
    try {
      aiResult = await analyzeWithAI(productName, ingredientsText);
    } catch (naraErr) {
      console.warn("NaraRouter failed, trying Gemini:", naraErr);
      try {
        aiResult = await analyzeWithGemini(productName, ingredientsText);
      } catch (geminiErr) {
        console.error("Both AI providers failed:", geminiErr);
        aiResult = {
          healthScore: 50,
          analysis:
            "Unable to generate AI analysis at this time. Please try again later.",
          summaryPoints: [],
          alertMessage: undefined,
        };
      }
    }

    const result = buildResult(barcode, productName, ingredientsText, brand, imageUrl, aiResult);

    // 5. Cache to Redis (24h)
    if (redis) {
      try {
        await redis.set(`scan:${barcode}`, result, { ex: 86400 });
      } catch (e) {
        console.warn("Redis write failed:", e);
      }
    }

    // 6. Cache to Supabase
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
    } catch (e) {
      console.warn("Supabase write failed:", e);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
