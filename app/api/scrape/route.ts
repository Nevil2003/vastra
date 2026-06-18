import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const baseUrl = new URL(url);

    function getMeta(prop: string): string {
      return (
        html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"))?.[1] ||
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, "i"))?.[1] ||
        ""
      );
    }

    const ogTitle = getMeta("og:title") || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || "";
    const site = getMeta("og:site_name") || baseUrl.hostname.replace(/^www\./, "");

    // Structured product data from JSON-LD
    let productName = "";
    let brand = "";
    let price = "";

    const jsonLdRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let jm: RegExpExecArray | null;
    const images: { src: string; alt: string; label?: string }[] = [];

    while ((jm = jsonLdRe.exec(html)) !== null) {
      try {
        const d = JSON.parse(jm[1]);
        const entries = Array.isArray(d) ? d : [d];
        for (const entry of entries) {
          // Product or similar schema
          if (!productName && entry.name) productName = entry.name;
          if (!brand) {
            brand =
              typeof entry.brand === "string"
                ? entry.brand
                : entry.brand?.name || "";
          }
          if (!price) {
            const offers = entry.offers ?? entry.Offer;
            if (offers) {
              const first = Array.isArray(offers) ? offers[0] : offers;
              price = String(first?.price ?? "").replace(/[^0-9.]/g, "");
            }
          }
          // Images from JSON-LD
          const imgs = Array.isArray(entry.image) ? entry.image : entry.image ? [entry.image] : [];
          for (const img of imgs) {
            const src = typeof img === "string" ? img : img?.url || img?.contentUrl || "";
            if (src) push(src, entry.name || productName || ogTitle);
          }
        }
      } catch { /* malformed JSON-LD */ }
    }

    // og:image
    const ogImg = getMeta("og:image");
    if (ogImg) push(resolveUrl(ogImg, baseUrl), productName || ogTitle, "main");

    // OpenGraph price meta (e-commerce)
    if (!price) price = getMeta("product:price:amount").replace(/[^0-9.]/g, "");

    // All <img> tags
    const imgTagRe = /<img([^>]+)>/gi;
    let m: RegExpExecArray | null;
    while ((m = imgTagRe.exec(html)) !== null) {
      const attrs = m[1];
      const src =
        attrs.match(/\ssrc=["']([^"']+)["']/i)?.[1] ||
        attrs.match(/\sdata-src=["']([^"']+)["']/i)?.[1] ||
        attrs.match(/\sdata-lazy=["']([^"']+)["']/i)?.[1] || "";
      if (!src) continue;
      const alt = attrs.match(/\salt=["']([^"']*)["']/i)?.[1] || "";
      push(src, alt);
    }

    // Deduplicate + filter noise
    const seen = new Set<string>();
    const unique = images.filter(({ src }) => {
      if (seen.has(src)) return false;
      seen.add(src);
      if (src.match(/\.(svg|gif|ico)(\?|$)/i)) return false;
      if (src.includes("pixel") || src.includes("beacon") || src.includes("spacer")) return false;
      return true;
    });

    return NextResponse.json({
      images: unique.slice(0, 40),
      title: ogTitle,
      site,
      productName,
      brand,
      price,
    });

    function push(src: string, alt = "", label?: string) {
      const abs = resolveUrl(src, baseUrl);
      if (abs) images.push({ src: abs, alt, label });
    }
  } catch {
    return NextResponse.json({ error: "Could not fetch the page" }, { status: 500 });
  }
}

function resolveUrl(src: string, base: URL): string {
  if (!src || src.startsWith("data:")) return "";
  try { return new URL(src, base).href; } catch { return ""; }
}
