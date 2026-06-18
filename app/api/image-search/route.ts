import { NextRequest, NextResponse } from "next/server";
import type { ImageResult } from "@/types";

const SERPER_KEY = process.env.SERPER_API_KEY;
const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  // --- Serper Google Image Search ---
  if (SERPER_KEY) {
    try {
      const res = await fetch("https://google.serper.dev/images", {
        method: "POST",
        headers: {
          "X-API-KEY": SERPER_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q, num: 20 }),
      });
      const data = await res.json();
      const results: ImageResult[] = (data.images ?? [])
        .filter((item: Record<string, string>) => item.imageUrl)
        .map((item: Record<string, string>) => {
          let site = "";
          try { site = new URL(item.link || "").hostname.replace(/^www\./, ""); } catch { /* ok */ }
          // Serper "source" is often the clean brand/store name
          const brand = item.source || site;
          // Strip site suffix from title if present ("Product - Brand | Site" → "Product")
          const rawTitle = item.title || q;
          const title = rawTitle.replace(/\s[\|\-–]\s.*$/, "").trim() || rawTitle;
          return { imageUrl: item.imageUrl, title, brand, site, link: item.link || "" };
        });
      return NextResponse.json({ results });
    } catch { /* fall through */ }
  }

  // --- Unsplash fallback ---
  if (UNSPLASH_KEY) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=20&orientation=portrait&client_id=${UNSPLASH_KEY}`
      );
      const data = await res.json();
      const results: ImageResult[] = (data.results ?? []).map((p: Record<string, unknown>) => ({
        imageUrl: (p.urls as Record<string, string>).regular,
        title: (p.alt_description as string) || q,
        brand: "Unsplash",
        site: "unsplash.com",
        link: ((p.links as Record<string, string>).html) || "",
      }));
      return NextResponse.json({ results });
    } catch { /* fall through */ }
  }

  return NextResponse.json({ results: [], noKey: true });
}
