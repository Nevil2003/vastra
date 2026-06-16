import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { generateOutfitRecommendations } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { occasion, weather } = await request.json();

    const items = (await prisma.clothingItem.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        category: true,
        color: true,
        colorName: true,
        occasion: true,
        season: true,
      },
    })).map((i) => ({ ...i, colorName: i.colorName || "Unknown", season: i.season || undefined }));

    const recommendations = await generateOutfitRecommendations(items, occasion, weather);
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Recommendation failed" }, { status: 500 });
  }
}
