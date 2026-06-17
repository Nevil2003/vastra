"use client";

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryEmoji } from "@/lib/utils";
import { Trash2, Sparkles, Shirt } from "lucide-react";
import Link from "next/link";

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/outfits");
    const data = await res.json();
    setOutfits(data.outfits || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function deleteOutfit(id: string) {
    if (!confirm("Delete this outfit?")) return;
    await fetch(`/api/outfits/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-center text-gray-500">Loading outfits...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#7A2438]">Lookbook</p>
          <h1 className="font-serif text-4xl font-semibold text-[#171012]">Saved looks</h1>
          <p className="mt-2 text-[#5D5050]">Your repeatable outfits, ready for re-wear and fit checks.</p>
        </div>
        <Link href="/builder">
          <Button className="gap-2"><Shirt className="h-4 w-4" /> Build look</Button>
        </Link>
      </div>

      {outfits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D9C3A8] bg-[#FFFDF8] p-12 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-[#7A2438]" />
          <h3 className="mt-4 font-serif text-2xl font-semibold text-[#171012]">No looks yet</h3>
          <p className="text-[#8C7F70]">Build a Studio look and save it here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {outfits.map((outfit) => (
            <Card key={outfit.id} hover>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-serif text-xl font-semibold text-[#171012]">{outfit.name}</div>
                    {outfit.occasion && <div className="text-xs uppercase tracking-[0.18em] text-[#7A2438]">{outfit.occasion}</div>}
                  </div>
                  <Button variant="danger" size="sm" onClick={() => deleteOutfit(outfit.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {outfit.items.map((slotItem: any) => (
                    <div key={slotItem.id} className="rounded-xl bg-[#F7F0E4] p-3 text-center text-sm">
                      <div className="text-2xl">{getCategoryEmoji(slotItem.item.category)}</div>
                      <div className="truncate font-medium text-[#171012]">{slotItem.item.name}</div>
                      <div className="text-xs uppercase tracking-wide text-[#8C7F70]">{slotItem.slot}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
