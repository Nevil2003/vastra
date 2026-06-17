"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Crown, MessageCircle, Palette, Shirt, Sparkles, TrendingUp } from "lucide-react";
import { getCategoryEmoji } from "@/lib/utils";

type Stats = {
  totalItems: number;
  brandCount: number;
  outfitCount: number;
  wardrobeValue: number;
};

type ClosetItem = {
  id: string;
  name: string;
  category: string;
};

type DailyPick = {
  reason: string;
  items: { slot: string; itemId: string }[];
} | null;

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [dailyPick, setDailyPick] = useState<DailyPick>(null);
  const [items, setItems] = useState<Record<string, ClosetItem>>({});

  useEffect(() => {
    async function load() {
      const [closetRes, outfitRes, valueRes, dailyRes] = await Promise.all([
        fetch("/api/closet"),
        fetch("/api/outfits"),
        fetch("/api/ai/value"),
        fetch("/api/ai/daily"),
      ]);

      const closet = await closetRes.json();
      const outfits = await outfitRes.json();
      const value = await valueRes.json();
      const daily = await dailyRes.json();

      const itemMap: Record<string, ClosetItem> = {};
      closet.items?.forEach((item: ClosetItem) => (itemMap[item.id] = item));

      setStats({
        totalItems: closet.items?.length || 0,
        brandCount: new Set(closet.items?.map((item: { brand?: string }) => item.brand).filter(Boolean)).size,
        outfitCount: outfits.outfits?.length || 0,
        wardrobeValue: value.declaredTotal || value.aiEstimate?.total || 0,
      });
      setItems(itemMap);
      setDailyPick(daily.pick);
    }
    load();
  }, []);

  function shareWhatsApp() {
    const text = "Vastra styled this look from my own closet.";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#E7D9C8] bg-[#171012] p-6 text-[#FFFDF8] shadow-xl shadow-[#171012]/10">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D69A2D]">Today in your atelier</p>
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-5xl font-semibold leading-none">Ready before the mirror.</h1>
            <p className="mt-4 max-w-2xl text-white/65">
              Add pieces, save looks, and let Vastra remember what works for weddings, office,
              monsoon days, and everything between.
            </p>
          </div>
          <Link href="/closet">
            <Button className="gap-2 bg-[#F3DFA9] text-[#171012] hover:bg-[#D69A2D]">
              <Shirt className="h-4 w-4" />
              Add pieces
            </Button>
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Pieces", stats?.totalItems ?? "-"],
          ["Brands", stats?.brandCount ?? "-"],
          ["Looks", stats?.outfitCount ?? "-"],
          ["Closet value", `INR ${(stats?.wardrobeValue ?? 0).toLocaleString("en-IN")}`],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="mt-0">
              <div className="font-serif text-3xl font-semibold text-[#7A2438]">{value}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-500">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#7A2438]" /> Daily look
          </CardTitle>
          <CardContent>
            {dailyPick ? (
              <div className="space-y-4">
                <p className="text-[#5D5050]">{dailyPick.reason}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dailyPick.items.map((slotItem) => {
                    const item = items[slotItem.itemId];
                    if (!item) return null;
                    return (
                      <div key={slotItem.slot} className="flex items-center gap-3 rounded-lg border border-[#E7D9C8] bg-[#F7F0E4] p-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFFDF8] text-2xl shadow-sm">
                          {getCategoryEmoji(item.category)}
                        </div>
                        <div>
                          <div className="text-xs uppercase text-gray-500">{slotItem.slot}</div>
                          <div className="font-semibold text-[#171012]">{item.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" onClick={shareWhatsApp} className="gap-2">
                  <MessageCircle className="h-4 w-4" /> Share fit check
                </Button>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Add a few items to get your first styled look.</p>
                <Link href="/closet">
                  <Button className="mt-4 gap-2">
                    <Shirt className="h-4 w-4" /> Add pieces
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-[#7A2438] text-[#FFFDF8]">
            <CardTitle className="flex items-center gap-2 text-[#FFFDF8]">
              <Crown className="h-5 w-5 text-[#F3DFA9]" /> Vastra Pro
            </CardTitle>
            <CardContent>
              <p className="text-white/80">Unlimited pieces, AI wardrobe audits, and richer styling memory.</p>
              <Link href="/pro">
                <Button className="mt-4 w-full bg-[#F3DFA9] text-[#171012] hover:bg-[#D69A2D]">Upgrade INR 99/mo</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-[#7A2438]" /> Styling studio
            </CardTitle>
            <CardContent>
              <p className="text-sm text-gray-600">Mix your closet into wedding, office, casual, and monsoon looks.</p>
              <Link href="/builder">
                <Button variant="secondary" className="mt-4 w-full gap-2">
                  <TrendingUp className="h-4 w-4" /> Build a look
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
