import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { estimateWardrobeValue } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();
    const items = await prisma.clothingItem.findMany({
      where: { userId: user.id },
      select: { category: true, estimatedValue: true },
    });

    const aiEstimate = await estimateWardrobeValue(items);
    const declaredTotal = items.reduce((sum, i) => sum + (i.estimatedValue || 0), 0);

    return NextResponse.json({
      aiEstimate,
      declaredTotal,
      itemCount: items.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Valuation failed" }, { status: 500 });
  }
}
