# Vastra - AI Digital Closet

A full-stack, AI-powered digital closet and outfit discovery app built for the Indian market.

## Features

- 📱 AI auto-tagging of clothing from photos (Google Gemini Vision)
- 👔 Digital closet with search, filters & brand tracking
- 🎨 Outfit builder with AI color matching & occasion recommendations
- 🌅 Daily AI outfit pick based on weather & wardrobe
- 💰 Wardrobe valuation (insurance-ready)
- 💎 Stripe subscription gating for Pro (₹99/mo)
- 💬 WhatsApp outfit sharing
- 🇮🇳 Indian sizes, weather, occasions & wedding-focused

## Tech Stack

- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS v4
- Prisma ORM + SQLite (local) / PostgreSQL (production)
- JWT auth (iron-session style via jose)
- Google Gemini API
- Stripe Checkout + Webhooks
- Cloudinary (optional, base64 fallback)

## Quick Start

```bash
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your keys

# Run migrations & seed local DB
npx prisma migrate dev
npx prisma generate

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="change-me"
GEMINI_API_KEY="your-gemini-key"
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PRICE_ID="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

## Production Deployment

1. Create a PostgreSQL database (Supabase / Neon / Vercel Postgres).
2. Set `DATABASE_URL` to your Postgres connection string.
3. Run `npx prisma migrate deploy`.
4. Add all env vars to Vercel.
5. Deploy with `vercel --prod`.

## Stripe Webhook

For local testing:
```bash
stripe listen --forward-to localhost:3000/api/subscription/webhook
```

## License

Proprietary - Vastra product by Nevil Parekh.
