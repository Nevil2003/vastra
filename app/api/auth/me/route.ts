import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.subscription?.plan || "free",
        status: user.subscription?.status || "inactive",
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
