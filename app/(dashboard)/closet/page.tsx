"use client";

import { useMemo, useState } from "react";
import {
  Check, ExternalLink, Heart,
  LayoutGrid, LayoutList, List,
  Plus, Search, SlidersHorizontal, Shirt,
} from "lucide-react";
import { useAddModal } from "@/lib/add-modal-context";
import { GarmentCard } from "@/components/wardrobe/garment-card";
import { AddWishlistModal } from "@/components/wardrobe/add-wishlist-modal";
import { Button } from "@/components/ui/button";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { updateItem } from "@/lib/firestore";
import { formatCurrency } from "@/lib/utils";
import { Garment, WishlistItem } from "@/types";
import { cn } from "@/lib/utils";

const ALL = "All";
type ViewMode = "grid2" | "grid3" | "list";
type SortKey  = "newest" | "oldest" | "name" | "worn";
type Tab      = "closet" | "wishlist";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "name",   label: "Name" },
  { key: "worn",   label: "Most worn" },
];

export default function ClosetPage() {
  const { openAdd } = useAddModal();

  // ── Tab ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>("closet");

  // ── Closet state ─────────────────────────────────────────────────────────
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState(ALL);
  const [view, setView]         = useState<ViewMode>("grid2");
  const [sort, setSort]         = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const { items: garments, loading: garmentsLoading } = useUserCollection<Garment>("garments");

  // ── Wishlist state ────────────────────────────────────────────────────────
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
  const { items: wishlist, loading: wishlistLoading } = useUserCollection<WishlistItem>("wishlist");

  // ── Closet computed ───────────────────────────────────────────────────────
  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(garments.map((g) => g.category)))],
    [garments]
  );

  const filtered = useMemo(() => {
    let list = garments.filter((g) => {
      const text = `${g.name} ${g.brand} ${g.colorName} ${g.fabric}`.toLowerCase();
      return text.includes(search.toLowerCase()) && (category === ALL || g.category === category);
    });
    if (sort === "newest") list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sort === "oldest") list = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (sort === "name")   list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "worn")   list = [...list].sort((a, b) => b.wearCount - a.wearCount);
    return list;
  }, [garments, search, category, sort]);

  const activeWishlist    = wishlist.filter((i) => !i.purchased).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const purchasedWishlist = wishlist.filter((i) => i.purchased);

  return (
    <div className="space-y-0">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">
            {tab === "closet" ? "Closet" : "Wishlist"}
          </h1>
          <p className="mt-0.5 text-sm text-[#888888]">
            {tab === "closet"
              ? `${garments.length} items`
              : `${activeWishlist.length} saved`}
          </p>
        </div>
        <Button
          onClick={tab === "closet" ? openAdd : () => setWishlistModalOpen(true)}
          size="sm"
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          {tab === "closet" ? "Add item" : "Add wish"}
        </Button>
      </div>

      {/* ── Tab switcher ─────────────────────────────────────────────── */}
      <div className="flex rounded-xl border border-[#EEEEEE] bg-[#F8F8F8] p-1 gap-1 mb-4">
        {(["closet", "wishlist"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-200 capitalize",
              tab === t
                ? "bg-white text-[#111111] shadow-sm"
                : "text-[#AAAAAA] hover:text-[#111111]"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ══ CLOSET TAB ══════════════════════════════════════════════════ */}
      {tab === "closet" && (
        <>
          {/* Search */}
          <div className="relative pb-3">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#AAAAAA]" />
            <input
              className="w-full rounded-xl border border-[#EEEEEE] bg-[#F8F8F8] py-2.5 pl-10 pr-4 text-sm text-[#111111] placeholder:text-[#AAAAAA] outline-none focus:border-[#111111] focus:bg-white transition-all"
              placeholder="Search your closet…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter + Sort + View toggle */}
          <div className="flex items-center gap-2 pb-3">
            <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    category === cat
                      ? "bg-[#111111] text-white"
                      : "bg-[#F3F3F3] text-[#888888] hover:bg-[#EBEBEB] hover:text-[#111111]"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative shrink-0">
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-full border border-[#EEEEEE] bg-white px-3 py-1.5 text-xs font-semibold text-[#888888] transition hover:border-[#111111] hover:text-[#111111]"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {SORTS.find((s) => s.key === sort)?.label}
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full z-10 mt-1.5 min-w-[130px] overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white shadow-lg">
                  {SORTS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => { setSort(s.key); setSortOpen(false); }}
                      className={cn(
                        "flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-[#F8F8F8]",
                        sort === s.key ? "font-semibold text-[#111111]" : "text-[#888888]"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex shrink-0 rounded-xl border border-[#EEEEEE] bg-[#F8F8F8] p-0.5">
              {([
                { mode: "grid2" as ViewMode, Icon: LayoutGrid },
                { mode: "grid3" as ViewMode, Icon: LayoutList },
                { mode: "list"  as ViewMode, Icon: List },
              ]).map(({ mode, Icon }) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  className={cn(
                    "rounded-lg p-1.5 transition-colors",
                    view === mode ? "bg-white text-[#111111] shadow-sm" : "text-[#BBBBBB] hover:text-[#888888]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {garmentsLoading ? (
            <div className={cn("grid gap-3", view === "grid3" ? "grid-cols-3 sm:grid-cols-4" : view === "list" ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className={cn("rounded-2xl bg-[#F3F3F3] animate-pulse", view === "list" ? "h-20" : "aspect-[3/4]")} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className={cn("grid gap-3", view === "grid3" ? "grid-cols-3 sm:grid-cols-4" : view === "list" ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}>
              {filtered.map((garment) => (
                <GarmentCard key={garment.id} garment={garment} viewMode={view} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#EEEEEE] py-20 text-center">
              <Shirt className="h-10 w-10 text-[#E0E0E0]" />
              <p className="mt-4 font-semibold text-[#111111]">
                {search || category !== ALL ? "No items match" : "Your closet is empty"}
              </p>
              <p className="mt-1 text-sm text-[#888888]">
                {search || category !== ALL ? "Try a different search or filter" : "Add your first piece to get started"}
              </p>
              {!search && category === ALL && (
                <Button className="mt-6" onClick={openAdd}>Add first item</Button>
              )}
            </div>
          )}
        </>
      )}

      {/* ══ WISHLIST TAB ════════════════════════════════════════════════ */}
      {tab === "wishlist" && (
        <div className="space-y-6">
          {wishlistLoading ? (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-[#F3F3F3] animate-pulse aspect-[3/4]" />
              ))}
            </div>
          ) : activeWishlist.length > 0 ? (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {activeWishlist.map((item) => (
                <div key={item.id} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#F5F5F5]">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Heart className="h-10 w-10 text-[#D0D0D0]" />
                      </div>
                    )}
                    <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[#111111] capitalize shadow-sm">
                      {item.priority}
                    </span>
                  </div>
                  <div className="mt-2 px-0.5">
                    <p className="truncate text-sm font-medium text-[#111111]">{item.name}</p>
                    <p className="text-xs text-[#888888]">{item.category}</p>
                    {item.price && (
                      <p className="mt-0.5 text-sm font-semibold text-[#111111]">{formatCurrency(item.price)}</p>
                    )}
                    <div className="mt-2 flex gap-1.5">
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="secondary" className="gap-1.5 text-xs px-2.5 py-1">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Shop
                          </Button>
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs px-2.5 py-1"
                        onClick={() => updateItem("wishlist", item.id, { purchased: true })}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Got it
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#E8E8E8] bg-white py-20 text-center">
              <Heart className="h-10 w-10 text-[#E0E0E0]" />
              <p className="mt-4 font-semibold text-[#111111]">Nothing saved yet</p>
              <p className="mt-1 text-sm text-[#888888]">Save pieces you want before you buy them</p>
              <Button className="mt-6" onClick={() => setWishlistModalOpen(true)}>Add first wish</Button>
            </div>
          )}

          {purchasedWishlist.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider">Purchased</h2>
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                {purchasedWishlist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#E8E8E8] bg-white px-4 py-3">
                    <Check className="h-4 w-4 shrink-0 text-[#888888]" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#888888] line-through">{item.name}</p>
                      <p className="text-xs text-[#AAAAAA]">{item.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AddWishlistModal open={wishlistModalOpen} onClose={() => setWishlistModalOpen(false)} />
    </div>
  );
}
