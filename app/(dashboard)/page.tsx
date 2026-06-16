"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Sparkles, Shirt, Palette, TrendingUp, Crown, Share2, MessageCircle } from "lucide-react";
import { getCategoryEmoji } from "@/lib/utils";

type Stats = {
  totalItems: number;
  brandCount: number;
  outfitCount: number;
  wardrobeValue: number;
};

type DailyPick = {
  reason: string;
  items: { slot: string; itemId: string }[];
} | null;

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [dailyPick, setDailyPick] = useState<DailyPick>(null);
  const [items, setItems] = useState<Record<string, any>>({});

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

      const itemMap: Record<string, any> = {};
      closet.items?.forEach((i: any) => (itemMap[i.id] = i));

      setStats({
        totalItems: closet.items?.length || 0,
        brandCount: new Set(closet.items?.map((i: any) => i.brand).filter(Boolean)).size,
        outfitCount: outfits.outfits?.length || 0,
        wardrobeValue: value.declaredTotal || value.aiEstimate?.total || 0,
      });
      setItems(itemMap);
      setDailyPick(daily.pick);
    }
    load();
  }, []);

  function shareWhatsApp() {
    const text = "Check out my digital closet on Vastra! 👘✨";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A1410]">Good day 👋</h1>
        <p className="text-[#2D2D2D]/70">Here is what your AI stylist found today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-[#C1440E]">{stats?.totalItems ?? "-"}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-[#C1440E]">{stats?.brandCount ?? "-"}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">Brands</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-[#C1440E]">{stats?.outfitCount ?? "-"}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">Outfits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-[#C1440E]">
              ₹{(stats?.wardrobeValue ?? 0).toLocaleString("en-IN")}
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-500">Est. Value</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#D4A574]" /> AI Daily Pick
          </CardTitle>
          <CardContent>
            {dailyPick ? (
              <div className="space-y-4">
                <p className="text-[#2D2D2D]">{dailyPick.reason}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dailyPick.items.map((slotItem) => {
                    const item = items[slotItem.itemId];
                    if (!item) return null;
                    return (
                      <div key={slotItem.slot} className="flex items-center gap-3 rounded-lg border border-[#E8DDD5] bg-[#F5F1ED] p-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                          {getCategoryEmoji(item.category)}
                        </div>
                        <div>
                          <div className="text-xs uppercase text-gray-500">{slotItem.slot}</div>
                          <div className="font-semibold text-[#1A1410]">{item.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" onClick={shareWhatsApp} className="gap-2">
                  <MessageCircle className="h-4 w-4" /> Share on WhatsApp
                </Button>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p>Add a few items to get your first AI daily outfit.</p>
                <Link href="/closet">
                  <Button className="mt-4 gap-2">
                    <Shirt className="h-4 w-4" /> Add Items
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-[#1A1410] text-white">
            <CardTitle className="flex items-center gap-2 text-white">
              <Crown className="h-5 w-5 text-[#D4A574]" /> Vastra Pro
            </CardTitle>
            <CardContent>
              <p className="text-white/80">Unlimited items, AI wardrobe audits, resale valuation & more.</p>
              <Link href="/pro">
                <Button className="mt-4 w-full">Upgrade ₹99/mo</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-[#D4A574]" /> Outfit Builder
            </CardTitle>
            <CardContent>
              <p className="text-sm text-gray-600">Mix & match your closet with AI color matching.</p>
              <Link href="/builder">
                <Button variant="secondary" className="mt-4 w-full gap-2">
                  <TrendingUp className="h-4 w-4" /> Build Outfit
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
