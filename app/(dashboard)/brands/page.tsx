"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Check, ExternalLink, Flame, Plus, Search, Store, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  customBrandsStorageKey,
  followedBrandsStorageKey,
  getDefaultFollowedBrandIds,
  indianBrands,
  IndianBrand,
} from "@/lib/brand-data";

export default function BrandsPage() {
  const [followedBrandIds, setFollowedBrandIds] = useState<string[]>([]);
  const [customBrands, setCustomBrands] = useState<IndianBrand[]>([]);
  const [query, setQuery] = useState("");
  const [signal, setSignal] = useState("all");

  useEffect(() => {
    const stored = window.localStorage.getItem(followedBrandsStorageKey);
    const storedCustom = window.localStorage.getItem(customBrandsStorageKey);

    setFollowedBrandIds(stored ? JSON.parse(stored) : getDefaultFollowedBrandIds());
    setCustomBrands(storedCustom ? JSON.parse(storedCustom) : []);
  }, []);

  const allBrands = useMemo(() => [...indianBrands, ...customBrands], [customBrands]);
  const followedBrands = allBrands.filter((brand) => followedBrandIds.includes(brand.id));
  const filteredBrands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allBrands.filter((brand) => {
      const matchesQuery =
        !normalizedQuery ||
        [brand.name, brand.category, brand.collection, brand.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesSignal = signal === "all" || brand.signal === signal;

      return matchesQuery && matchesSignal;
    });
  }, [allBrands, query, signal]);

  const normalizedQuery = query.trim().toLowerCase();
  const exactBrandExists = allBrands.some((brand) => brand.name.toLowerCase() === normalizedQuery);
  const canAddSearchedBrand = normalizedQuery.length > 1 && !exactBrandExists;

  function toggleBrand(brandId: string) {
    setFollowedBrandIds((current) => {
      const next = current.includes(brandId)
        ? current.filter((id) => id !== brandId)
        : [...current, brandId];

      window.localStorage.setItem(followedBrandsStorageKey, JSON.stringify(next));
      return next;
    });
  }

  function addSearchedBrand() {
    const brandName = query.trim();
    if (!brandName || exactBrandExists) return;

    const id = `custom-${brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    const newBrand: IndianBrand = {
      id,
      name: brandName,
      category: "Custom brand",
      signal: "New collection",
      signalText: "Added to your personal watchlist",
      collection: "Track this brand manually for sales and drops",
      matchReason: "You added this brand as a favourite to watch.",
      palette: "#EAF7FA",
      url: `https://www.google.com/search?q=${encodeURIComponent(`${brandName} sale collection India`)}`,
      image: `https://placehold.co/640x820/EAF7FA/111111?text=${encodeURIComponent(brandName)}`,
      tags: ["custom", "watchlist"],
    };

    const nextCustomBrands = [...customBrands, newBrand];
    const nextFollowedBrands = [...new Set([...followedBrandIds, id])];

    setCustomBrands(nextCustomBrands);
    setFollowedBrandIds(nextFollowedBrands);
    window.localStorage.setItem(customBrandsStorageKey, JSON.stringify(nextCustomBrands));
    window.localStorage.setItem(followedBrandsStorageKey, JSON.stringify(nextFollowedBrands));
    setQuery("");
  }

  function removeCustomBrand(brandId: string) {
    const nextCustomBrands = customBrands.filter((brand) => brand.id !== brandId);
    const nextFollowedBrands = followedBrandIds.filter((id) => id !== brandId);

    setCustomBrands(nextCustomBrands);
    setFollowedBrandIds(nextFollowedBrands);
    window.localStorage.setItem(customBrandsStorageKey, JSON.stringify(nextCustomBrands));
    window.localStorage.setItem(followedBrandsStorageKey, JSON.stringify(nextFollowedBrands));
  }

  return (
    <div className="space-y-6">
      <section className="mastical-glass overflow-hidden rounded-lg p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Indian brand radar</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Track sales and drops</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Follow favourite Indian labels and let Local Lookbook surface sale alerts, restocks, and collections that match your wardrobe intent.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 md:w-80">
            <Stat label="Following" value={followedBrandIds.length} />
            <Stat label="Sales" value={allBrands.filter((brand) => brand.signal === "Sale live").length} />
            <Stat label="Custom" value={customBrands.length} />
          </div>
        </div>
      </section>

      {followedBrands.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/60">Your watchlist</h2>
              <p className="mt-1 text-sm text-white/42">Live signals from brands you follow.</p>
            </div>
            <Bell className="h-5 w-5 text-cyan-100/70" />
          </div>
          <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide">
            <div className="flex gap-3 pb-1">
              {followedBrands.map((brand) => (
                <WatchCard key={brand.id} brand={brand} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2">
            <Search className="h-4 w-4 text-white/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your favourite brand or type a new one..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/32"
            />
          </label>
          <select
            value={signal}
            onChange={(event) => setSignal(event.target.value)}
            className="rounded-lg border border-white/10 bg-[#101014] px-3 py-2 text-sm text-white outline-none"
          >
            <option value="all">All signals</option>
            <option value="Sale live">Sale live</option>
            <option value="New collection">New collection</option>
            <option value="Restock">Restock</option>
            <option value="Price drop">Price drop</option>
          </select>
        </div>

        {canAddSearchedBrand && (
          <button
            type="button"
            onClick={addSearchedBrand}
            className="flex w-full items-center justify-between gap-4 rounded-lg border border-dashed border-cyan-100/30 bg-cyan-100/[0.06] px-4 py-3 text-left transition hover:bg-cyan-100/[0.1]"
          >
            <div>
              <p className="text-sm font-semibold text-white">Add &quot;{query.trim()}&quot; to your watchlist</p>
              <p className="mt-1 text-xs text-white/42">
                We will save it as a custom brand and use a search link for sales and collections.
              </p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-[#030306]">
              <Plus className="h-4 w-4" />
            </span>
          </button>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBrands.map((brand) => {
            const followed = followedBrandIds.includes(brand.id);
            const custom = brand.id.startsWith("custom-");

            return (
              <article key={brand.id} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={brand.image} alt={brand.name} className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {brand.signal}
                  </span>
                  {brand.discount && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold text-[#030306]">
                      {brand.discount}
                    </span>
                  )}
                </div>

                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">{brand.name}</h3>
                      <p className="mt-0.5 text-xs text-white/45">{brand.category}</p>
                    </div>
                    <Store className="h-5 w-5 shrink-0 text-cyan-100/70" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">{brand.signalText}</p>
                    <p className="mt-1 text-sm leading-6 text-white/50">{brand.collection}</p>
                    <p className="mt-2 text-xs leading-5 text-white/38">{brand.matchReason}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {brand.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/48">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={followed ? "secondary" : "primary"}
                      onClick={() => toggleBrand(brand.id)}
                      className="gap-1.5"
                    >
                      {followed ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                      {followed ? "Following" : "Follow"}
                    </Button>
                    {custom ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-1.5"
                        onClick={() => removeCustomBrand(brand.id)}
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </Button>
                    ) : (
                    <a href={brand.url} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="w-full gap-1.5">
                        <ExternalLink className="h-4 w-4" />
                        View sale
                      </Button>
                    </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function WatchCard({ brand }: { brand: IndianBrand }) {
  return (
    <div className="w-64 shrink-0 rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{brand.name}</p>
          <p className="mt-1 text-xs text-white/42">{brand.signalText}</p>
        </div>
        <Flame className="h-4 w-4 text-cyan-100/80" />
      </div>
      <p className="mt-4 line-clamp-2 text-xs leading-5 text-white/48">{brand.matchReason}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-3">
      <p className="text-lg font-semibold leading-none text-white">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/38">{label}</p>
    </div>
  );
}
