"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { BarChart3, Palette, Shirt, Sparkles, TrendingUp } from "lucide-react";

type ClosetItem = {
  id: string;
  name: string;
  category: string;
  brand?: string | null;
  colorName?: string | null;
  occasion?: string | null;
  estimatedValue?: number | null;
  wearCount?: number;
};

type Outfit = {
  id: string;
  occasion?: string | null;
  items: { itemId: string }[];
};

function topEntries(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values.filter(Boolean)) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

export default function InsightsPage() {
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [closetRes, outfitRes] = await Promise.all([fetch("/api/closet"), fetch("/api/outfits")]);
      const closet = await closetRes.json();
      const outfitData = await outfitRes.json();
      setItems(closet.items || []);
      setOutfits(outfitData.outfits || []);
      setLoading(false);
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const value = items.reduce((sum, item) => sum + (item.estimatedValue || 0), 0);
    const usedIds = new Set(outfits.flatMap((outfit) => outfit.items.map((item) => item.itemId)));
    const usedPieces = items.filter((item) => usedIds.has(item.id)).length;
    const colors = topEntries(items.map((item) => item.colorName || ""));
    const categories = topEntries(items.map((item) => item.category));
    const occasions = topEntries(items.map((item) => item.occasion || ""));
    const bestGap =
      categories.length > 0 && !categories.some(([category]) => category === "Shoes")
        ? "You have outfits, but shoes are thin. Add one neutral pair."
        : items.length < 8
          ? "Add 8-10 pieces to unlock stronger styling memory."
          : "Your base is ready. Save 3 looks to reveal repeat patterns.";

    return { value, usedPieces, colors, categories, occasions, bestGap };
  }, [items, outfits]);

  const statCards = [
    { label: "Pieces", value: items.length, Icon: Shirt },
    { label: "Saved looks", value: outfits.length, Icon: Sparkles },
    { label: "Styled pieces", value: stats.usedPieces, Icon: BarChart3 },
    { label: "Closet value", value: `INR ${stats.value.toLocaleString("en-IN")}`, Icon: TrendingUp },
  ];

  if (loading) return <p className="text-center text-[#8C7F70]">Reading your wardrobe...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#7A2438]">Insights</p>
          <h1 className="font-serif text-4xl font-semibold text-[#171012]">Closet intelligence</h1>
          <p className="mt-2 max-w-2xl text-[#5D5050]">
            See what you own, what you actually style, and what would unlock better outfits.
          </p>
        </div>
        <Link href="/closet">
          <Button className="gap-2">
            <Shirt className="h-4 w-4" /> Add pieces
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, Icon }) => (
          <Card key={label}>
            <CardContent className="mt-0">
              <Icon className="h-5 w-5 text-[#7A2438]" />
              <div className="mt-3 font-serif text-3xl font-semibold text-[#171012]">{value}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8C7F70]">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-[#7A2438]" /> Palette
          </CardTitle>
          <CardContent className="space-y-3">
            {stats.colors.length ? stats.colors.map(([color, count]) => (
              <div key={color} className="flex items-center justify-between rounded-lg bg-[#F7F0E4] px-3 py-2">
                <span>{color}</span>
                <span className="font-semibold text-[#7A2438]">{count}</span>
              </div>
            )) : <p className="text-sm text-[#8C7F70]">Add pieces to see your color story.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Category mix</CardTitle>
          <CardContent className="space-y-3">
            {stats.categories.length ? stats.categories.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between rounded-lg bg-[#F7F0E4] px-3 py-2">
                <span>{category}</span>
                <span className="font-semibold text-[#7A2438]">{count}</span>
              </div>
            )) : <p className="text-sm text-[#8C7F70]">Your closet is empty.</p>}
          </CardContent>
        </Card>

        <Card className="bg-[#171012] text-[#FFFDF8]">
          <CardTitle className="text-[#FFFDF8]">Next best move</CardTitle>
          <CardContent>
            <p className="text-white/75">{stats.bestGap}</p>
            <Link href="/builder">
              <Button className="mt-5 bg-[#F3DFA9] text-[#171012] hover:bg-[#D69A2D]">
                Open Studio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {stats.occasions.length > 0 && (
        <Card>
          <CardTitle>Occasion coverage</CardTitle>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.occasions.map(([occasion, count]) => (
              <div key={occasion} className="rounded-xl border border-[#E7D9C8] bg-[#F7F0E4] p-4">
                <div className="font-serif text-xl font-semibold text-[#171012]">{occasion}</div>
                <div className="mt-1 text-sm text-[#8C7F70]">{count} pieces ready</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
