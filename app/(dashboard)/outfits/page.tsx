"use client";

import { FormEvent, useMemo, useState } from "react";
import { increment } from "firebase/firestore";
import { Check, Plus, Shirt } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { GarmentCard } from "@/components/wardrobe/garment-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createItem, updateItem } from "@/lib/firestore";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { Garment, Outfit, WearLog } from "@/types";

export default function OutfitsPage() {
  const { user } = useAuth();
  const { items: garments } = useUserCollection<Garment>("garments");
  const { items: outfits } = useUserCollection<Outfit>("outfits");
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState("");
  const selectedGarments = useMemo(() => garments.filter((item) => selected.includes(item.id)), [garments, selected]);

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function saveOutfit(e: FormEvent) {
    e.preventDefault();
    if (!user || selected.length < 2) return;
    await createItem<Omit<Outfit, "id" | "createdAt" | "updatedAt">>("outfits", {
      userId: user.uid,
      name: name || `Look ${new Date().toLocaleDateString("en-IN")}`,
      occasion,
      garmentIds: selected,
      wornCount: 0,
    });
    setSelected([]);
    setName("");
    setOccasion("");
  }

  async function markWorn(outfit: Outfit) {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    await createItem<Omit<WearLog, "id" | "createdAt">>("wearLogs", {
      userId: user.uid,
      date: today,
      garmentIds: outfit.garmentIds,
      outfitId: outfit.id,
      occasion: outfit.occasion,
    });
    await updateItem("outfits", outfit.id, { wornCount: increment(1), lastWorn: today });
    await Promise.all(outfit.garmentIds.map((id) => {
      const garment = garments.find((item) => item.id === id);
      return garment ? updateItem("garments", id, { wearCount: increment(1), lastWorn: today }) : Promise.resolve();
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#3C3489]">Outfits</p>
        <h1 className="font-serif text-4xl font-semibold text-[#17152D]">Build and save looks</h1>
        <p className="mt-2 text-[#5F596B]">Manual outfit planning from your real wardrobe.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardTitle>Pick pieces</CardTitle>
            <CardContent>
              {garments.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {garments.map((garment) => (
                    <GarmentCard key={garment.id} garment={garment} selected={selected.includes(garment.id)} onClick={() => toggle(garment.id)} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#857C73]">Add wardrobe items first.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardTitle>Current look</CardTitle>
          <CardContent>
            <form onSubmit={saveOutfit} className="space-y-3">
              <Input placeholder="Look name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} />
              <div className="space-y-2">
                {selectedGarments.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl bg-[#F8F3EA] p-3">
                    <span className="h-4 w-4 rounded-full" style={{ background: item.color }} />
                    <span className="text-sm font-medium text-[#17152D]">{item.name}</span>
                  </div>
                ))}
                {!selectedGarments.length && <p className="text-sm text-[#857C73]">Select at least two pieces.</p>}
              </div>
              <Button type="submit" className="w-full gap-2" disabled={selected.length < 2}>
                <Plus className="h-4 w-4" /> Save look
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardTitle>Lookbook</CardTitle>
        <CardContent>
          {outfits.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {outfits.map((outfit) => (
                <div key={outfit.id} className="rounded-2xl border border-[#E5DACB] bg-[#F8F3EA] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-[#17152D]">{outfit.name}</h3>
                      <p className="text-sm text-[#857C73]">{outfit.occasion || "Everyday"} · worn {outfit.wornCount || 0}x</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => markWorn(outfit)} className="gap-2">
                      <Check className="h-4 w-4" /> Worn
                    </Button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {outfit.garmentIds.map((id) => {
                      const item = garments.find((garment) => garment.id === id);
                      return (
                        <div key={id} className="rounded-xl bg-[#FFFDF8] p-3 text-sm">
                          <Shirt className="mb-2 h-4 w-4 text-[#3C3489]" />
                          {item?.name || "Missing item"}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#857C73]">Saved looks will appear here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
