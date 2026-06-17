import { NextResponse } from "next/server";
import { requireAuth, isPro } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sampleWardrobe } from "@/lib/sample-wardrobe";

export async function POST() {
  try {
    const user = await requireAuth();
    const existingSample = await prisma.clothingItem.count({
      where: { userId: user.id, aiTags: { contains: "sample wardrobe" } },
    });

    if (existingSample > 0) {
      const items = await prisma.clothingItem.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ items, seeded: false });
    }

    const existingCount = await prisma.clothingItem.count({ where: { userId: user.id } });
    if (!isPro(user) && existingCount + sampleWardrobe.length > 50) {
      return NextResponse.json(
        { error: "Free plan limited to 50 items. Remove a few pieces or upgrade to Pro." },
        { status: 403 }
      );
    }

    await prisma.clothingItem.createMany({
      data: sampleWardrobe.map((item) => ({
        ...item,
        userId: user.id,
        aiTags: "sample wardrobe",
      })),
    });

    const items = await prisma.clothingItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items, seeded: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load sample wardrobe" }, { status: 500 });
  }
}
