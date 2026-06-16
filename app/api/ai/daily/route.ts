import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { generateDailyOutfit } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const weather = searchParams.get("weather") || undefined;

    const items = (await prisma.clothingItem.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        category: true,
        color: true,
        colorName: true,
        occasion: true,
      },
    })).map((i) => ({ ...i, colorName: i.colorName || "" }));

    const pick = await generateDailyOutfit(items, weather);
    return NextResponse.json({ pick });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Daily outfit failed" }, { status: 500 });
  }
}
