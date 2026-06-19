"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, Circle, Globe, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageResult } from "@/types";

export interface ImageSelection {
  imageUrl: string;
  name?: string;
  brand?: string;
  price?: string;
  sourceUrl?: string;
}

const SUGGESTIONS = [
  "Zara oversized blazer",
  "Everlane relaxed fit jeans",
  "Madewell cozy knit sweater",
  "H&M minimalist gold necklace",
  "Mango chic leather handbag",
  "ASOS chunky sole loafers",
  "Uniqlo linen shirt",
  "Nike Air Max sneakers",
];

interface ScrapedImage { src: string; alt: string; label?: string; }
interface ScrapeData {
  images: ScrapedImage[];
  title: string;
  site: string;
  productName: string;
  brand: string;
  price: string;
}

interface SearchOverlayProps {
  open: boolean;
  mode?: "search" | "url";
  onClose: () => void;
  onSelect: (selections: ImageSelection[]) => void;
}

export function SearchOverlay({ open, mode = "search", onClose, onSelect }: SearchOverlayProps) {
  const [query, setQuery]               = useState("");
  const [searchResults, setSearchResults] = useState<ImageResult[]>([]);
  const [scrapeData, setScrapeData]     = useState<ScrapeData | null>(null);
  const [scrapedUrl, setScrapedUrl]     = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  // key → ImageSelection for every selected result
  const [selected, setSelected] = useState<Map<string, ImageSelection>>(new Map());
  const inputRef = useRef<HTMLInputElement>(null);

  const isUrl = /^https?:\/\//i.test(query.trim());

  useEffect(() => {
    if (open) {
      setQuery("");
      setSearchResults([]);
      setScrapeData(null);
      setScrapedUrl("");
      setError("");
      setSelected(new Map());
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function runSearch(q: string) {
    setLoading(true);
    setError("");
    setSearchResults([]);
    setScrapeData(null);
    setSelected(new Map());
    try {
      const res = await fetch(`/api/image-search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.noKey) setError("no-key");
      else setSearchResults(data.results ?? []);
    } catch {
      setError("Search failed — try again");
    } finally {
      setLoading(false);
    }
  }

  async function runScrape(url: string) {
    setScrapedUrl(url);
    setLoading(true);
    setError("");
    setSearchResults([]);
    setScrapeData(null);
    setSelected(new Map());
    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else setScrapeData(data as ScrapeData);
    } catch {
      setError("Could not fetch the page");
    } finally {
      setLoading(false);
    }
  }

  function submit() {
    const q = query.trim();
    if (!q) return;
    if (isUrl) runScrape(q);
    else runSearch(q);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); submit(); }
  }

  function pickSuggestion(s: string) {
    setQuery(s);
    runSearch(s);
  }

  function toggleResult(key: string, sel: ImageSelection) {
    setSelected(prev => {
      const next = new Map(prev);
      if (next.has(key)) next.delete(key);
      else next.set(key, sel);
      return next;
    });
  }

  function confirmSelection() {
    const selections = Array.from(selected.values());
    if (selections.length === 0) return;
    onSelect(selections);
    onClose();
  }

  const hasResults = searchResults.length > 0 || (scrapeData?.images?.length ?? 0) > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#111111]/96 backdrop-blur-md">
      {/* Search bar */}
      <div className="mx-auto w-full max-w-xl px-4 pb-3 pt-10">
        <div className="flex items-center gap-3 rounded-full bg-[#2A2A2A] px-5 py-3.5 shadow-lg">
          {isUrl
            ? <Globe className="h-5 w-5 shrink-0 text-[#666666]" />
            : <Search className="h-5 w-5 shrink-0 text-[#666666]" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "url"
                ? "Paste a product page URL to scan images…"
                : "Search items or paste a URL…"
            }
            className="flex-1 bg-transparent text-base text-white placeholder:text-[#555555] outline-none"
          />
          {query ? (
            <button
              onClick={() => { setQuery(""); setSearchResults([]); setScrapeData(null); setError(""); setSelected(new Map()); }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3A3A3A] text-white transition hover:bg-[#4A4A4A]"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3A3A3A] text-white transition hover:bg-[#4A4A4A]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {query.trim() && !loading && (
          <p className="mt-2 text-center text-xs text-[#555555]">
            Press{" "}
            <kbd className="rounded bg-[#2A2A2A] px-1.5 py-0.5 font-mono text-[#888888]">↵</kbd>
            {" "}to {isUrl ? "scan page for images" : "search"}
          </p>
        )}
        {hasResults && (
          <p className="mt-2 text-center text-xs text-[#555555]">
            Tap images to select · tap again to deselect
          </p>
        )}
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-xl flex-1 overflow-y-auto px-4 pb-32">

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-sm text-[#555555]">
              {isUrl ? "Scanning page for images…" : "Searching the web…"}
            </p>
          </div>
        )}

        {!query && !loading && (
          <div>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={s}
                onClick={() => pickSuggestion(s)}
                style={{ animationDelay: `${i * 25}ms` }}
                className={cn(
                  "animate-rise flex w-full items-center gap-4 rounded-lg px-2 py-4 text-left transition-colors hover:bg-white/[0.03]",
                  i < SUGGESTIONS.length - 1 && "border-b border-white/[0.06]"
                )}
              >
                <Search className="h-4 w-4 shrink-0 text-[#555555]" />
                <span className="text-base font-medium text-white">{s}</span>
              </button>
            ))}
          </div>
        )}

        {error === "no-key" && (
          <div className="animate-rise py-10 text-center text-sm text-[#555555]">
            Add <span className="text-white">SERPER_API_KEY</span> or{" "}
            <span className="text-white">NEXT_PUBLIC_UNSPLASH_ACCESS_KEY</span> to your .env to enable search.
          </div>
        )}
        {error && error !== "no-key" && (
          <div className="animate-rise py-10 text-center text-sm text-red-400">{error}</div>
        )}

        {/* Search results */}
        {!loading && searchResults.length > 0 && (
          <div className="animate-rise grid grid-cols-2 gap-3">
            {searchResults.map((r, i) => {
              const key = `${r.imageUrl}-${i}`;
              const sel: ImageSelection = { imageUrl: r.imageUrl, name: r.title, brand: r.brand, sourceUrl: r.link || undefined };
              return (
                <ResultCard
                  key={key}
                  imageUrl={r.imageUrl}
                  title={r.title}
                  brand={r.brand}
                  site={r.site}
                  delay={i * 20}
                  selected={selected.has(key)}
                  onToggle={() => toggleResult(key, sel)}
                />
              );
            })}
          </div>
        )}

        {/* Scraped images */}
        {!loading && scrapeData && scrapeData.images.length > 0 && (
          <div className="animate-rise">
            <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <Globe className="h-4 w-4 text-[#555555]" />
              <span className="text-sm text-[#888888]">{scrapeData.site}</span>
              {(scrapeData.productName || scrapeData.title) && (
                <span className="truncate text-xs text-[#555555]">
                  — {scrapeData.productName || scrapeData.title}
                </span>
              )}
              {scrapeData.price && (
                <span className="ml-auto text-sm font-semibold text-white">
                  ₹{Number(scrapeData.price).toLocaleString()}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {scrapeData.images.map((img, i) => {
                const key = `${img.src}-${i}`;
                const sel: ImageSelection = {
                  imageUrl: img.src,
                  name: scrapeData.productName || scrapeData.title || img.alt || undefined,
                  brand: scrapeData.brand || scrapeData.site || undefined,
                  price: scrapeData.price || undefined,
                  sourceUrl: scrapedUrl || undefined,
                };
                return (
                  <ResultCard
                    key={key}
                    imageUrl={img.src}
                    title={img.alt || scrapeData.productName || scrapeData.title}
                    brand={scrapeData.brand || scrapeData.site}
                    site={scrapeData.site}
                    delay={i * 20}
                    selected={selected.has(key)}
                    onToggle={() => toggleResult(key, sel)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {!loading && !error && query.trim() && !hasResults && (
          <div className="animate-rise py-10 text-center text-sm text-[#555555]">
            No images found — try different keywords
          </div>
        )}
      </div>

      {/* Sticky confirm bar */}
      {selected.size > 0 && (
        <div className="absolute bottom-0 inset-x-0 bg-[#1A1A1A] border-t border-white/10 px-4 py-4 flex items-center justify-between gap-4">
          <span className="text-sm text-[#888888]">
            {selected.size} item{selected.size !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={confirmSelection}
            className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-95"
          >
            Add {selected.size} item{selected.size !== 1 ? "s" : ""} →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({
  imageUrl, title, brand, site, delay, selected, onToggle,
}: {
  imageUrl: string;
  title: string;
  brand: string;
  site: string;
  delay: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;

  return (
    <button
      onClick={onToggle}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        "animate-rise group flex flex-col overflow-hidden rounded-2xl bg-[#1E1E1E] text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]",
        selected ? "ring-2 ring-white" : "hover:ring-2 hover:ring-white/20"
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#2A2A2A]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          onError={() => setBroken(true)}
        />
        {/* Selection indicator */}
        <div className="absolute top-2 right-2">
          {selected
            ? <CheckCircle className="h-5 w-5 text-white drop-shadow" />
            : <Circle className="h-5 w-5 text-white/40 group-hover:text-white/70 transition-colors" />
          }
        </div>
        {selected && (
          <div className="absolute inset-0 bg-white/10" />
        )}
      </div>
      <div className="px-2.5 py-2.5">
        {title && (
          <p className="line-clamp-2 text-xs font-medium leading-snug text-white">{title}</p>
        )}
        <div className="mt-1 flex items-center gap-1">
          {brand && brand !== site && (
            <>
              <span className="truncate text-[10px] font-semibold text-[#AAAAAA]">{brand}</span>
              <span className="text-[10px] text-[#444444]">·</span>
            </>
          )}
          <span className="flex items-center gap-0.5 truncate text-[10px] text-[#555555]">
            <Globe className="h-2.5 w-2.5 shrink-0" />
            {site}
          </span>
        </div>
      </div>
    </button>
  );
}
