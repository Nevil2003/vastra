import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { stripe, STRIPE_PRICE_ID, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const user = await requireAuth();

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe not configured. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID." },
        { status: 503 }
      );
    }

    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe!.customers.create({
        email: user.email,
        name: user.name || undefined,
      });
      customerId = customer.id;
      await prisma.subscription.update({
        where: { userId: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe!.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pro?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pro?canceled=1`,
      metadata: { userId: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
