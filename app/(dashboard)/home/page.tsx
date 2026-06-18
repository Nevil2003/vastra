"use client";

import Link from "next/link";
import { CalendarDays, Heart, NotebookText, Plus, Ruler, Shirt } from "lucide-react";
import { AddGarmentModal } from "@/components/wardrobe/add-garment-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { Garment, Occasion, WearLog, WishlistItem } from "@/types";
import { useState } from "react";

export default function HomePage() {
  const [adding, setAdding] = useState(false);
  const { items: garments } = useUserCollection<Garment>("garments");
  const { items: occasions } = useUserCollection<Occasion>("occasions");
  const { items: logs } = useUserCollection<WearLog>("wearLogs");
  const { items: wishlist } = useUserCollection<WishlistItem>("wishlist");

  const totalValue = garments.reduce((sum, item) => sum + (item.price || 0), 0);
  const stitching = garments.filter((item) => !["not-needed", "delivered"].includes(item.stitchingStatus));
  const nextOccasion = occasions
    .filter((occasion) => new Date(occasion.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  const unworn = garments.filter((item) => item.wearCount === 0).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#3C3489]">Dashboard</p>
          <h1 className="font-serif text-4xl font-semibold text-[#17152D]">Your wardrobe command center</h1>
          <p className="mt-2 text-[#5F596B]">Clothes, stitching, occasions, and wear memory in one place.</p>
        </div>
        <Button onClick={() => setAdding(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add item
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Wardrobe items", value: garments.length, icon: Shirt },
          { label: "Closet value", value: formatCurrency(totalValue), icon: Ruler },
          { label: "Wear logs", value: logs.length, icon: NotebookText },
          { label: "Wishlist", value: wishlist.filter((item) => !item.purchased).length, icon: Heart },
        ].map((stat) => (
          <Card key={stat.label}>
            <stat.icon className="h-5 w-5 text-[#3C3489]" />
            <div className="mt-3 font-serif text-3xl font-semibold text-[#17152D]">{stat.value}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#857C73]">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Today needs attention</CardTitle>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#F8F3EA] p-4">
              <CalendarDays className="h-5 w-5 text-[#3C3489]" />
              <p className="mt-3 font-semibold text-[#17152D]">{nextOccasion ? nextOccasion.title : "No upcoming occasion"}</p>
              <p className="mt-1 text-sm text-[#5F596B]">
                {nextOccasion ? new Date(nextOccasion.date).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Add an event to plan the outfit early."}
              </p>
              <Link href="/occasions"><Button size="sm" variant="outline" className="mt-4">Plan occasions</Button></Link>
            </div>
            <div className="rounded-2xl bg-[#F8F3EA] p-4">
              <Ruler className="h-5 w-5 text-[#C8793D]" />
              <p className="mt-3 font-semibold text-[#17152D]">{stitching.length} stitching tasks</p>
              <p className="mt-1 text-sm text-[#5F596B]">Track trials, tailor pickups, blouse work, alterations, and payments.</p>
              <Link href="/wardrobe"><Button size="sm" variant="outline" className="mt-4">Open wardrobe</Button></Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Wear more of this</CardTitle>
          <CardContent className="space-y-3">
            {unworn.length ? unworn.map((item) => (
              <div key={item.id} className="rounded-xl bg-[#F8F3EA] p-3">
                <p className="font-medium text-[#17152D]">{item.name}</p>
                <p className="text-sm text-[#857C73]">{item.category} · never logged</p>
              </div>
            )) : <p className="text-sm text-[#857C73]">Add wardrobe items to see underused pieces.</p>}
          </CardContent>
        </Card>
      </div>

      <AddGarmentModal open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}
