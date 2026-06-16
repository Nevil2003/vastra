import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  try {
    const user = await requireAuth();
    const outfits = await prisma.outfit.findMany({
      where: { userId: user.id },
      include: { items: { include: { item: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ outfits });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  occasion: z.string().optional(),
  note: z.string().optional(),
  aiMatchScore: z.number().optional(),
  items: z.array(
    z.object({
      slot: z.string(),
      itemId: z.string(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = createSchema.parse(body);

    const outfit = await prisma.outfit.create({
      data: {
        name: parsed.name,
        occasion: parsed.occasion,
        note: parsed.note,
        aiMatchScore: parsed.aiMatchScore,
        userId: user.id,
        items: {
          create: parsed.items.map((i) => ({
            slot: i.slot,
            item: { connect: { id: i.itemId } },
          })),
        },
      },
      include: { items: { include: { item: true } } },
    });

    return NextResponse.json({ outfit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to save outfit" }, { status: 500 });
  }
}
