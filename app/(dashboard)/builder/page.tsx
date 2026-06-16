"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getCategoryEmoji } from "@/lib/utils";
import { RotateCcw, Save, Sparkles } from "lucide-react";

const slots = ["top", "bottom", "shoes", "accessory"];

type ClosetItem = {
  id: string;
  name: string;
  brand?: string | null;
  category: string;
};

type Recommendation = {
  reason: string;
  matchScore?: number;
  items: { slot: string; itemId: string }[];
};

export default function BuilderPage() {
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [outfit, setOutfit] = useState<Record<string, ClosetItem | undefined>>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [occasion, setOccasion] = useState("");
  const [weather, setWeather] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/closet").then((res) => res.json()).then((data) => setItems(data.items || []));
  }, []);

  function itemsForSlot(slot: string) {
    if (slot === "top") return items.filter((item) => ["Shirt/Top", "T-Shirt", "Sweater", "Jacket", "Kurta"].includes(item.category));
    if (slot === "bottom") return items.filter((item) => ["Jeans", "Pants", "Skirt", "Shorts", "Dress", "Saree", "Lehenga"].includes(item.category));
    if (slot === "shoes") return items.filter((item) => item.category === "Shoes");
    return items.filter((item) => item.category === "Accessories");
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

  function applyRecommendation(rec: Recommendation) {
    const next: Record<string, ClosetItem> = {};
    rec.items.forEach((slotItem) => {
      const item = items.find((candidate) => candidate.id === slotItem.itemId);
      if (item) next[slotItem.slot] = item;
    });
    setOutfit(next);
  }

  async function saveOutfit() {
    const filled = Object.entries(outfit).filter((entry): entry is [string, ClosetItem] => Boolean(entry[1]));
    if (filled.length < 2) return alert("Select at least 2 items");
    setSaving(true);
    const res = await fetch("/api/outfits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || `Look ${new Date().toLocaleDateString()}`,
        occasion,
        items: filled.map(([slot, item]) => ({ slot, itemId: item.id })),
      }),
    });
    setSaving(false);
    if (res.ok) {
      alert("Look saved");
      setOutfit({});
      setName("");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#7A2438]">Studio</p>
        <h1 className="font-serif text-4xl font-semibold text-[#171012]">Build a look</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Your outfit</CardTitle>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {slots.map((slot) => (
                <div key={slot} className="rounded-lg border border-dashed border-[#D69A2D] bg-[#F7F0E4] p-4 text-center">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7A2438]">{slot}</div>
                  {outfit[slot] ? (
                    <div className="space-y-2">
                      <div className="text-xl font-bold text-[#7A2438]">{getCategoryEmoji(outfit[slot].category)}</div>
                      <div className="font-serif text-lg font-semibold text-[#171012]">{outfit[slot].name}</div>
                      <div className="text-xs text-gray-500">{outfit[slot].brand}</div>
                    </div>
                  ) : (
                    <div className="text-xl font-bold tracking-wide text-gray-300">{slot.slice(0, 2).toUpperCase()}</div>
                  )}
                  <Select
                    value={outfit[slot]?.id || ""}
                    onChange={(e) => {
                      const item = items.find((candidate) => candidate.id === e.target.value);
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
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Look name" />
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
              <Sparkles className="h-5 w-5 text-[#7A2438]" /> AI Stylist
            </CardTitle>
            <CardContent className="space-y-3">
              <Select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                <option value="">Any occasion</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="office">Office</option>
                <option value="party">Party</option>
                <option value="wedding">Wedding</option>
                <option value="date">Date night</option>
                <option value="ethnic">Ethnic</option>
              </Select>
              <Select value={weather} onChange={(e) => setWeather(e.target.value)}>
                <option value="">Any weather</option>
                <option value="hot">Hot / summer</option>
                <option value="cold">Cold / winter</option>
                <option value="rainy">Rainy / monsoon</option>
              </Select>
              <Button onClick={getRecommendations} isLoading={loading} className="w-full gap-2">
                <Sparkles className="h-4 w-4" /> Generate looks
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
                    className="cursor-pointer rounded-lg border border-[#E7D9C8] p-3 transition hover:border-[#7A2438] hover:bg-[#F7F0E4]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#171012]">Look {idx + 1}</span>
                      <span className="text-xs font-bold text-[#7A2438]">{rec.matchScore || "85"}% match</span>
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
