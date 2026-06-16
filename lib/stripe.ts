import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" })
  : null;

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "";

export function isStripeConfigured() {
  return Boolean(stripe && STRIPE_PRICE_ID);
}
