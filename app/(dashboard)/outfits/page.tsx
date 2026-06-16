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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1A1410]">Saved Outfits</h1>
        <Link href="/builder">
          <Button className="gap-2"><Shirt className="h-4 w-4" /> Build New</Button>
        </Link>
      </div>

      {outfits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E8DDD5] bg-white p-12 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-[#D4A574]" />
          <h3 className="mt-4 text-lg font-semibold text-[#1A1410]">No outfits yet</h3>
          <p className="text-gray-500">Build your first AI-powered outfit.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {outfits.map((outfit) => (
            <Card key={outfit.id}>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#1A1410]">{outfit.name}</div>
                    {outfit.occasion && <div className="text-xs uppercase text-[#C1440E]">{outfit.occasion}</div>}
                  </div>
                  <Button variant="danger" size="sm" onClick={() => deleteOutfit(outfit.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {outfit.items.map((slotItem: any) => (
                    <div key={slotItem.id} className="rounded-md bg-[#F5F1ED] p-2 text-center text-sm">
                      <div className="text-xl">{getCategoryEmoji(slotItem.item.category)}</div>
                      <div className="truncate font-medium text-[#1A1410]">{slotItem.item.name}</div>
                      <div className="text-xs text-gray-500">{slotItem.slot}</div>
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
