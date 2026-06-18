"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Calendar, ChevronRight, Edit2, Heart, Plus, Shirt, Tag, Trash2,
} from "lucide-react";
import { AddGarmentModal } from "@/components/wardrobe/add-garment-modal";
import { Button } from "@/components/ui/button";
import { removeItem, updateItem } from "@/lib/firestore";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { cn } from "@/lib/utils";
import { Garment, GarmentTag, Outfit, WearLog } from "@/types";

const TAG_LABELS: Record<GarmentTag, string> = {
  "favorite":          "Favourite",
  "donate-maybe":      "Donate?",
  "needs-alteration":  "Needs alteration",
  "rarely-worn":       "Rarely worn",
  "sentimental":       "Sentimental",
};

export default function GarmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();

  const { items: garments }     = useUserCollection<Garment>("garments");
  const { items: wearLogs }     = useUserCollection<WearLog>("wearLogs");
  const { items: outfits }      = useUserCollection<Outfit>("outfits");

  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const garment = garments.find((g) => g.id === id);

  const garmentLogs = useMemo(
    () => wearLogs.filter((l) => l.garmentIds.includes(id)).slice(0, 20),
    [wearLogs, id]
  );

  const usedInOutfits = useMemo(
    () => outfits.filter((o) => o.garmentIds.includes(id)),
    [outfits, id]
  );

  const costPerWear = useMemo(() => {
    if (!garment?.price || !garment.wearCount) return null;
    return (garment.price / garment.wearCount).toFixed(0);
  }, [garment]);

  useEffect(() => {
    if (garments.length > 0 && !garment) router.replace("/closet");
  }, [garment, garments.length, router]);

  async function logWear() {
    if (!garment) return;
    const today = new Date().toISOString().split("T")[0];
    await updateItem("garments", id, {
      wearCount: (garment.wearCount || 0) + 1,
      lastWorn: today,
    });
  }

  async function toggleFavorite() {
    if (!garment) return;
    const tags = garment.tags ?? [];
    const next = tags.includes("favorite")
      ? tags.filter((t) => t !== "favorite")
      : [...tags, "favorite"];
    await updateItem("garments", id, { tags: next });
  }

  async function deleteItem() {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    setDeleting(true);
    await removeItem("garments", id);
    router.replace("/closet");
  }

  if (!garment) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
      </div>
    );
  }

  const isFav = garment.tags?.includes("favorite");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Back */}
      <Link href="/closet" className="inline-flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#111111] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to closet
      </Link>

      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-[#F5F5F5]">
        {garment.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={garment.imageUrl} alt={garment.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Shirt className="h-20 w-20 text-[#D8D8D8]" />
          </div>
        )}
        {/* Actions overlay */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            onClick={toggleFavorite}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition hover:bg-white"
          >
            <Heart className={cn("h-4 w-4", isFav ? "fill-[#EF4444] text-[#EF4444]" : "text-[#888888]")} />
          </button>
          <button
            onClick={() => setEditOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition hover:bg-white"
          >
            <Edit2 className="h-4 w-4 text-[#888888]" />
          </button>
        </div>
        {/* Color dot */}
        <span
          className="absolute bottom-3 left-3 h-5 w-5 rounded-full border-2 border-white shadow"
          style={{ background: garment.color }}
        />
      </div>

      {/* Name + category */}
      <div>
        <h1 className="text-2xl font-bold text-[#111111]">{garment.name}</h1>
        <p className="mt-0.5 text-sm text-[#888888]">
          {garment.category}
          {garment.subcategory ? ` · ${garment.subcategory}` : ""}
          {garment.brand ? ` · ${garment.brand}` : ""}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-[#F0F0F0] rounded-2xl border border-[#F0F0F0] bg-[#FAFAFA]">
        {[
          { label: "Times worn", value: garment.wearCount || 0 },
          { label: "Cost/wear", value: costPerWear ? `₹${costPerWear}` : "—" },
          { label: "Value", value: garment.price ? `₹${garment.price}` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center py-4">
            <span className="text-xl font-bold text-[#111111]">{value}</span>
            <span className="mt-0.5 text-[10px] text-[#AAAAAA]">{label}</span>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="space-y-3 rounded-2xl border border-[#F0F0F0] bg-white p-4">
        {[
          { label: "Size",         value: garment.size },
          { label: "Fabric",       value: garment.fabric },
          { label: "Colour",       value: garment.colorName || garment.color },
          { label: "Season",       value: garment.season },
          { label: "Occasion",     value: garment.occasion },
          { label: "Condition",    value: garment.condition },
          { label: "Purchased",    value: garment.purchaseDate },
          { label: "Stitching",    value: garment.stitchingStatus !== "not-needed" ? garment.stitchingStatus.replace(/-/g, " ") : undefined },
        ].filter((r) => r.value).map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-[#888888]">{label}</span>
            <span className="font-medium text-[#111111] capitalize">{value}</span>
          </div>
        ))}

        {/* Weather tags */}
        {garment.weatherTags && garment.weatherTags.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#888888]">Weather</span>
            <div className="flex gap-1">
              {garment.weatherTags.map((t) => (
                <span key={t} className="rounded-full bg-[#F3F3F3] px-2.5 py-0.5 text-xs font-medium text-[#888888] capitalize">{t}</span>
              ))}
            </div>
          </div>
        )}

        {garment.notes && (
          <div className="border-t border-[#F5F5F5] pt-3 text-sm text-[#888888]">
            {garment.notes}
          </div>
        )}
      </div>

      {/* Tags */}
      {garment.tags && garment.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {garment.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-[#F3F3F3] px-3 py-1.5 text-xs font-medium text-[#888888]"
            >
              <Tag className="h-3 w-3" />
              {TAG_LABELS[tag as GarmentTag] ?? tag}
            </span>
          ))}
        </div>
      )}

      {/* Log wear + mark worn */}
      <Button className="w-full gap-2" onClick={logWear}>
        <Plus className="h-4 w-4" /> Log wear today
      </Button>

      {/* Used in outfits */}
      {usedInOutfits.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#888888]">Used in outfits</p>
          <div className="space-y-2">
            {usedInOutfits.map((o) => (
              <Link
                key={o.id}
                href="/outfits"
                className="flex items-center justify-between rounded-2xl border border-[#F0F0F0] bg-white px-4 py-3 transition hover:border-[#DDDDDD] hover:shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-[#111111]">{o.name}</p>
                  {o.occasion && <p className="text-xs text-[#AAAAAA]">{o.occasion}</p>}
                </div>
                <ChevronRight className="h-4 w-4 text-[#CCCCCC]" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Wear history */}
      {garmentLogs.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#888888]">Wear history</p>
          <div className="space-y-2">
            {garmentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 rounded-2xl border border-[#F0F0F0] bg-white px-4 py-3"
              >
                <Calendar className="h-4 w-4 shrink-0 text-[#CCCCCC]" />
                <div>
                  <p className="text-sm font-medium text-[#111111]">
                    {new Date(log.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  {log.occasion && <p className="text-xs text-[#AAAAAA]">{log.occasion}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete */}
      <button
        onClick={deleteItem}
        disabled={deleting}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        {deleting ? "Deleting…" : "Delete item"}
      </button>

      {/* Edit modal — pre-fills from existing garment data */}
      <AddGarmentModal open={editOpen} onClose={() => setEditOpen(false)} editGarment={garment} />
    </div>
  );
}
