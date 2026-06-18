"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Shirt } from "lucide-react";
import { AddGarmentModal } from "@/components/wardrobe/add-garment-modal";
import { GarmentCard } from "@/components/wardrobe/garment-card";
import { Button } from "@/components/ui/button";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { Garment } from "@/types";
import { cn } from "@/lib/utils";

const ALL = "All";

export default function ClosetPage() {
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const { items: garments, loading } = useUserCollection<Garment>("garments");

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(garments.map((g) => g.category)))],
    [garments]
  );

  const filtered = garments.filter((item) => {
    const text = `${item.name} ${item.brand} ${item.colorName} ${item.fabric}`.toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchCat = category === ALL || item.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Closet</h1>
          <p className="mt-0.5 text-sm text-[#888888]">{garments.length} items</p>
        </div>
        <Button onClick={() => setAdding(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#AAAAAA]" />
        <input
          className="w-full rounded-full border border-[#E8E8E8] bg-white py-2.5 pl-10 pr-4 text-sm text-[#111111] placeholder:text-[#AAAAAA] outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10 transition-all"
          placeholder="Search your closet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              category === cat
                ? "bg-[#111111] text-white"
                : "bg-white border border-[#E8E8E8] text-[#888888] hover:border-[#111111] hover:text-[#111111]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-[#F0F0F0] animate-pulse" />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((garment) => (
            <GarmentCard key={garment.id} garment={garment} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#E8E8E8] bg-white py-20 text-center">
          <Shirt className="h-10 w-10 text-[#E0E0E0]" />
          <p className="mt-4 font-semibold text-[#111111]">
            {search || category !== ALL ? "No items match" : "Your closet is empty"}
          </p>
          <p className="mt-1 text-sm text-[#888888]">
            {search || category !== ALL ? "Try a different search or filter" : "Add your first piece to get started"}
          </p>
          {!search && category === ALL && (
            <Button className="mt-6" onClick={() => setAdding(true)}>
              Add first item
            </Button>
          )}
        </div>
      )}

      <AddGarmentModal open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}
