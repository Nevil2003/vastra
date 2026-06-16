import { NextResponse } from "next/server";
import { requireAuth, isPro } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  try {
    const user = await requireAuth();
    const items = await prisma.clothingItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  brand: z.string().optional(),
  color: z.string().min(1),
  colorName: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  occasion: z.string().optional(),
  season: z.string().optional(),
  imageUrl: z.string().optional(),
  estimatedValue: z.number().int().optional(),
  aiTags: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const pro = isPro(user);
    const existingCount = await prisma.clothingItem.count({ where: { userId: user.id } });

    if (!pro && existingCount >= 50) {
      return NextResponse.json(
        { error: "Free plan limited to 50 items. Upgrade to Vastra Pro." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createSchema.parse(body);

    const item = await prisma.clothingItem.create({
      data: {
        ...parsed,
        userId: user.id,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
