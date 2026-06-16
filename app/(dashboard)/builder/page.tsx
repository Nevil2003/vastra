"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getCategoryEmoji } from "@/lib/utils";
import { Sparkles, Save, RotateCcw, Shirt } from "lucide-react";

const slots = ["top", "bottom", "shoes", "accessory"];

export default function BuilderPage() {
  const [items, setItems] = useState<any[]>([]);
  const [outfit, setOutfit] = useState<Record<string, any>>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [occasion, setOccasion] = useState("");
  const [weather, setWeather] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/closet").then((r) => r.json()).then((d) => setItems(d.items || []));
  }, []);

  function itemsForSlot(slot: string) {
    if (slot === "top") return items.filter((i) => ["Shirt/Top", "T-Shirt", "Sweater", "Jacket"].includes(i.category));
    if (slot === "bottom") return items.filter((i) => ["Jeans", "Pants", "Skirt", "Shorts", "Dress"].includes(i.category));
    if (slot === "shoes") return items.filter((i) => i.category === "Shoes");
    return items.filter((i) => i.category === "Accessories");
  }

  async function getRecommendations() {
    setLoading(true);
    const res = await fetch("/api/ai/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ occasion, weather }),
    });
    const data = await res.json();
    setRecommendations(data.recommendations || []);
    setLoading(false);
  }

  function applyRecommendation(rec: any) {
    const newOutfit: Record<string, any> = {};
    rec.items.forEach((slotItem: any) => {
      const item = items.find((i) => i.id === slotItem.itemId);
      if (item) newOutfit[slotItem.slot] = item;
    });
    setOutfit(newOutfit);
  }

  async function saveOutfit() {
    const filled = Object.entries(outfit).filter(([_, v]) => v);
    if (filled.length < 2) return alert("Select at least 2 items");
    setSaving(true);
    const res = await fetch("/api/outfits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || `Outfit ${new Date().toLocaleDateString()}`,
        occasion,
        items: filled.map(([slot, item]) => ({ slot, itemId: item.id })),
      }),
    });
    setSaving(false);
    if (res.ok) {
      alert("Outfit saved!");
      setOutfit({});
      setName("");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#1A1410]">Outfit Builder</h1>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Your Outfit</CardTitle>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {slots.map((slot) => (
                <div key={slot} className="rounded-lg border-2 border-dashed border-[#D4A574] bg-[#F5F1ED] p-4 text-center">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#C1440E]">{slot}</div>
                  {outfit[slot] ? (
                    <div className="space-y-2">
                      <div className="text-4xl">{getCategoryEmoji(outfit[slot].category)}</div>
                      <div className="font-semibold text-[#1A1410]">{outfit[slot].name}</div>
                      <div className="text-xs text-gray-500">{outfit[slot].brand}</div>
                    </div>
                  ) : (
                    <div className="text-4xl text-gray-300">
                      {slot === "top" ? "👕" : slot === "bottom" ? "👖" : slot === "shoes" ? "👟" : "✨"}
                    </div>
                  )}
                  <Select
                    value={outfit[slot]?.id || ""}
                    onChange={(e) => {
                      const item = items.find((i) => i.id === e.target.value);
                      setOutfit({ ...outfit, [slot]: item });
                    }}
                    className="mt-3"
                  >
                    <option value="">Select {slot}</option>
                    {itemsForSlot(slot).map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Outfit name" />
              <Button onClick={saveOutfit} isLoading={saving} className="gap-2">
                <Save className="h-4 w-4" /> Save
              </Button>
              <Button variant="outline" onClick={() => setOutfit({})} className="gap-2">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#D4A574]" /> AI Stylist
            </CardTitle>
            <CardContent className="space-y-3">
              <Select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                <option value="">Any occasion</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="office">Office</option>
                <option value="party">Party</option>
                <option value="wedding">Wedding</option>
                <option value="date">Date Night</option>
              </Select>
              <Select value={weather} onChange={(e) => setWeather(e.target.value)}>
                <option value="">Any weather</option>
                <option value="hot">Hot / Summer</option>
                <option value="cold">Cold / Winter</option>
                <option value="rainy">Rainy / Monsoon</option>
              </Select>
              <Button onClick={getRecommendations} isLoading={loading} className="w-full gap-2">
                <Sparkles className="h-4 w-4" /> Generate Looks
              </Button>
            </CardContent>
          </Card>

          {recommendations.length > 0 && (
            <Card>
              <CardTitle>Suggestions</CardTitle>
              <CardContent className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    onClick={() => applyRecommendation(rec)}
                    className="cursor-pointer rounded-lg border border-[#E8DDD5] p-3 transition hover:border-[#D4A574] hover:bg-[#F5F1ED]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1A1410]">Look {idx + 1}</span>
                      <span className="text-xs font-bold text-[#C1440E]">{rec.matchScore || "85"}% match</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{rec.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
