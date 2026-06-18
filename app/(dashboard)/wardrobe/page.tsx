"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { AddGarmentModal } from "@/components/wardrobe/add-garment-modal";
import { GarmentCard } from "@/components/wardrobe/garment-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { Garment } from "@/types";

export default function WardrobePage() {
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stitching, setStitching] = useState("all");
  const { items: garments, loading } = useUserCollection<Garment>("garments");

  const categories = useMemo(() => ["all", ...new Set(garments.map((item) => item.category))], [garments]);
  const filtered = garments.filter((item) => {
    const text = `${item.name} ${item.brand} ${item.colorName} ${item.fabric} ${item.occasion}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesCategory = category === "all" || item.category === category;
    const matchesStitching = stitching === "all" || item.stitchingStatus === stitching;
    return matchesSearch && matchesCategory && matchesStitching;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#3C3489]">Wardrobe</p>
          <h1 className="font-serif text-4xl font-semibold text-[#17152D]">Everything you own</h1>
          <p className="mt-2 text-[#5F596B]">Clothes, fabrics, stitching status, tailor details, and cost per wear.</p>
        </div>
        <Button onClick={() => setAdding(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add item
        </Button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-[#E5DACB] bg-[#FFFDF8] p-3 md:grid-cols-[1fr_180px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#857C73]" />
          <Input className="pl-9" placeholder="Search wardrobe" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((item) => <option key={item} value={item}>{item === "all" ? "All categories" : item}</option>)}
        </Select>
        <Select value={stitching} onChange={(e) => setStitching(e.target.value)}>
          <option value="all">All stitching</option>
          <option value="to-stitch">To stitch</option>
          <option value="with-tailor">With tailor</option>
          <option value="trial">Trial</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
        </Select>
      </div>

      {loading ? (
        <p className="text-center text-[#857C73]">Loading wardrobe...</p>
      ) : filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((garment) => <GarmentCard key={garment.id} garment={garment} />)}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#D2C1AD] bg-[#FFFDF8] p-12 text-center">
          <h3 className="font-serif text-2xl font-semibold text-[#17152D]">Your wardrobe is ready for its first piece</h3>
          <p className="mt-2 text-[#5F596B]">Add a garment, fabric, accessory, or stitched order.</p>
          <Button className="mt-5" onClick={() => setAdding(true)}>Add first item</Button>
        </div>
      )}

      <AddGarmentModal open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}
