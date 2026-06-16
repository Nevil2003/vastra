import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  topSize: z.string().optional(),
  bottomSize: z.string().optional(),
  shoeSize: z.string().optional(),
  dressSize: z.string().optional(),
  footWidth: z.string().optional(),
  preferredBrand: z.string().optional(),
  location: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });
    return NextResponse.json({ profile });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = schema.parse(body);

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: parsed,
      create: { ...parsed, userId: user.id },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
