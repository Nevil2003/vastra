import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  try {
    const user = await requireAuth();
    const brands = await prisma.brand.findMany({ where: { userId: user.id } });
    return NextResponse.json({ brands });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

const schema = z.object({
  name: z.string().min(1),
  category: z.string().default("general"),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = schema.parse(body);

    const brand = await prisma.brand.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: parsed.name,
        },
      },
      update: { category: parsed.category },
      create: {
        name: parsed.name,
        category: parsed.category,
        userId: user.id,
      },
    });

    return NextResponse.json({ brand });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to add brand" }, { status: 500 });
  }
}
