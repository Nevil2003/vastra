"use client";

import { useMemo, useState } from "react";
import { Heart, Plus, Search, SlidersHorizontal } from "lucide-react";
import { OutfitBuilderModal } from "@/components/wardrobe/outfit-builder-modal";
import { OutfitCard } from "@/components/wardrobe/outfit-card";
import { Button } from "@/components/ui/button";
import { removeItem, updateItem } from "@/lib/firestore";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { cn } from "@/lib/utils";
import { Garment, Outfit } from "@/types";

const FILTER_OCCASIONS = ["All", "Casual", "Work", "Party", "Date", "Travel", "Formal", "Wedding", "Gym"];

export default function OutfitsPage() {
  const { items: outfits, loading } = useUserCollection<Outfit>("outfits");
  const { items: garments }         = useUserCollection<Garment>("garments");

  const [builderOpen, setBuilderOpen]  = useState(false);
  const [editOutfit, setEditOutfit]    = useState<Outfit | undefined>();
  const [search, setSearch]            = useState("");
  const [filterOccasion, setFilter]    = useState("All");
  const [showFavOnly, setShowFavOnly]  = useState(false);

  const garmentMap = useMemo(
    () => new Map(garments.map((g) => [g.id, g])),
    [garments]
  );

  const filtered = useMemo(() => outfits.filter((o) => {
    const matchSearch = !search || o.name.toLowerCase().includes(search.toLowerCase());
    const matchOcc    = filterOccasion === "All" || o.occasion === filterOccasion;
    const matchFav    = !showFavOnly || o.favorite;
    return matchSearch && matchOcc && matchFav;
  }), [outfits, search, filterOccasion, showFavOnly]);

  function openCreate() { setEditOutfit(undefined); setBuilderOpen(true); }
  function openEdit(o: Outfit) { setEditOutfit(o); setBuilderOpen(true); }

  async function deleteOutfit(id: string) {
    if (!confirm("Delete this outfit?")) return;
    await removeItem("outfits", id);
  }

  async function markWorn(o: Outfit) {
    const today = new Date().toISOString().split("T")[0];
    await updateItem("outfits", o.id, { wornCount: (o.wornCount || 0) + 1, lastWorn: today });
    for (const gId of o.garmentIds) {
      const g = garmentMap.get(gId);
      if (g) await updateItem("garments", gId, { wearCount: (g.wearCount || 0) + 1, lastWorn: today });
    }
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Outfits</h1>
          <p className="mt-0.5 text-sm text-[#888888]">{outfits.length} saved</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Create
        </Button>
      </div>

      {/* Search */}
      <div className="relative pb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#AAAAAA]" />
        <input
          className="w-full rounded-xl border border-[#EEEEEE] bg-[#F8F8F8] py-2.5 pl-10 pr-4 text-sm placeholder:text-[#AAAAAA] outline-none focus:border-[#111111] focus:bg-white transition-all"
          placeholder="Search outfits…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 pb-4">
        <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-hide">
          {FILTER_OCCASIONS.map((occ) => (
            <button
              key={occ}
              onClick={() => setFilter(occ)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                filterOccasion === occ ? "bg-[#111111] text-white" : "bg-[#F3F3F3] text-[#888888] hover:bg-[#EBEBEB]"
              )}
            >
              {occ}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowFavOnly((v) => !v)}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
            showFavOnly
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-[#EEEEEE] bg-white text-[#888888] hover:border-[#CCCCCC]"
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", showFavOnly && "fill-red-500 text-red-500")} /> Faves
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-[#F3F3F3]" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((outfit) => (
            <div key={outfit.id} className="group relative">
              <OutfitCard outfit={outfit} garmentMap={garmentMap} onClick={() => openEdit(outfit)} />
              <div className="absolute inset-x-0 bottom-8 hidden gap-1.5 p-2 group-hover:flex">
                <button
                  onClick={(e) => { e.stopPropagation(); markWorn(outfit); }}
                  className="flex-1 rounded-xl bg-[#111111] py-1.5 text-[10px] font-semibold text-white transition hover:bg-[#333333]"
                >
                  Worn today
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteOutfit(outfit.id); }}
                  className="rounded-xl bg-[#F3F3F3] px-2.5 py-1.5 text-[10px] font-semibold text-[#888888] transition hover:bg-red-50 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#EEEEEE] py-20 text-center">
          <SlidersHorizontal className="h-10 w-10 text-[#E0E0E0]" />
          <p className="mt-4 font-semibold text-[#111111]">
            {search || filterOccasion !== "All" || showFavOnly ? "No outfits match" : "No outfits yet"}
          </p>
          <p className="mt-1 text-sm text-[#888888]">
            {search || filterOccasion !== "All" || showFavOnly
              ? "Try changing your filter"
              : "Create your first outfit to get started"}
          </p>
          {!search && filterOccasion === "All" && !showFavOnly && (
            <Button className="mt-6 gap-1.5" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Create outfit
            </Button>
          )}
        </div>
      )}

      <OutfitBuilderModal
        open={builderOpen}
        onClose={() => { setBuilderOpen(false); setEditOutfit(undefined); }}
        outfit={editOutfit}
      />
    </div>
  );
}
