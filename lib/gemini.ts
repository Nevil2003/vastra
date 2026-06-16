import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export type ClothingAnalysis = {
  name: string;
  category: string;
  color: string;
  colorName: string;
  brand?: string;
  material?: string;
  occasion?: string;
  season?: string;
  estimatedValue: number;
  aiTags: string;
};

export async function analyzeClothingImage(base64Image: string, mimeType = "image/jpeg"): Promise<ClothingAnalysis> {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Analyze this clothing item image. Return ONLY a valid JSON object with these exact keys (no markdown, no extra text):
{
  "name": "short descriptive name",
  "category": "one of: Shirt/Top, T-Shirt, Jeans, Pants, Skirt, Dress, Shoes, Accessories, Jacket, Sweater, Shorts",
  "color": "hex color code like #1a1410",
  "colorName": "common color name",
  "brand": "brand name if visible, else null",
  "material": "fabric material if visible, else null",
  "occasion": "one of: casual, formal, office, party, wedding, sports, ethnic",
  "season": "one of: summer, winter, monsoon, all-season",
  "estimatedValue": "estimated price in INR as number",
  "aiTags": "comma separated tags"
}`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    },
  ]);

  const text = result.response.text();
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    name: parsed.name || "Clothing Item",
    category: parsed.category || "Shirt/Top",
    color: parsed.color || "#1a1410",
    colorName: parsed.colorName || "Unknown",
    brand: parsed.brand || null,
    material: parsed.material || null,
    occasion: parsed.occasion || "casual",
    season: parsed.season || "all-season",
    estimatedValue: Number(parsed.estimatedValue) || 0,
    aiTags: parsed.aiTags || "",
  };
}

export type OutfitRecommendation = {
  reason: string;
  matchScore: number;
  occasion: string;
  items: { slot: string; itemId: string; name: string }[];
};

export async function generateOutfitRecommendations(
  items: { id: string; name: string; category: string; color: string; colorName: string | null; occasion?: string | null; season?: string | null }[],
  occasion?: string,
  weather?: string
): Promise<OutfitRecommendation[]> {
  if (!genAI || items.length < 2) {
    return [];
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Given these wardrobe items, suggest 3 complete outfits${occasion ? ` for a ${occasion} occasion` : ""}${weather ? ` in ${weather} weather` : ""}.

Items:
${items.map((i) => `- ${i.id}: ${i.name} (${i.category}, ${i.colorName || i.color}${i.occasion ? ", " + i.occasion : ""}${i.season ? ", " + i.season : ""})`).join("\n")}

Return ONLY a valid JSON array with this shape (no markdown):
[
  {
    "reason": "why this outfit works",
    "matchScore": 85,
    "occasion": "casual",
    "items": [
      {"slot": "top", "itemId": "id-from-list", "name": "item name"},
      {"slot": "bottom", "itemId": "id-from-list", "name": "item name"},
      {"slot": "shoes", "itemId": "id-from-list", "name": "item name"},
      {"slot": "accessory", "itemId": "id-from-list", "name": "item name"}
    ]
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
}

export async function generateDailyOutfit(
  items: { id: string; name: string; category: string; color: string; colorName: string | null; occasion?: string | null }[],
  weather?: string
): Promise<{ reason: string; items: { slot: string; itemId: string }[] } | null> {
  if (!genAI || items.length < 2) return null;
  const recs = await generateOutfitRecommendations(items, "daily", weather);
  return recs[0] || null;
}

export async function estimateWardrobeValue(items: { category: string }[]): Promise<{ total: number; breakdown: Record<string, number> }> {
  const breakdown: Record<string, number> = {};
  let total = 0;

  const defaults: Record<string, number> = {
    "Shirt/Top": 1200,
    "T-Shirt": 800,
    Jeans: 2000,
    Pants: 1500,
    Skirt: 1200,
    Dress: 2500,
    Shoes: 2500,
    Accessories: 700,
    Jacket: 3000,
    Sweater: 1800,
    Shorts: 900,
  };

  for (const item of items) {
    const val = defaults[item.category] || 1000;
    breakdown[item.category] = (breakdown[item.category] || 0) + val;
    total += val;
  }

  return { total, breakdown };
}
