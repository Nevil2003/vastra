import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { analyzeClothingImage, estimateWardrobeValue } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { imageBase64, mimeType = "image/jpeg" } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const analysis = await analyzeClothingImage(imageBase64, mimeType);

    const item = await prisma.clothingItem.create({
      data: {
        ...analysis,
        userId: user.id,
        imageUrl: imageBase64.startsWith("http") ? imageBase64 : undefined,
      },
    });

    const allItems = await prisma.clothingItem.findMany({
      where: { userId: user.id },
      select: { category: true },
    });
    const valuation = await estimateWardrobeValue(allItems);

    return NextResponse.json({ item, valuation });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
