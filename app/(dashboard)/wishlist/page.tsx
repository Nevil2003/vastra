"use client";

import { useState } from "react";
import { Check, ExternalLink, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddWishlistModal } from "@/components/wardrobe/add-wishlist-modal";
import { updateItem } from "@/lib/firestore";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { formatCurrency } from "@/lib/utils";
import { WishlistItem } from "@/types";

export default function WishlistPage() {
  const { items } = useUserCollection<WishlistItem>("wishlist");
  const [open, setOpen] = useState(false);

  const active = items.filter((i) => !i.purchased);
  const purchased = items.filter((i) => i.purchased);
  const highPriority = active.filter((i) => i.priority === "high").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Intent board</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Wishlist</h1>
          <p className="mt-1 text-sm text-white/52">Save pieces before they become impulse buys.</p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add wish
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Saved" value={active.length} />
        <Stat label="High" value={highPriority} />
        <Stat label="Bought" value={purchased.length} />
      </div>

      {/* Active wishlist grid */}
      {active.length > 0 ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {active.map((item) => (
            <div key={item.id} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#F5F5F5]">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Heart className="h-10 w-10 text-[#D0D0D0]" />
                  </div>
                )}
                {/* Priority badge */}
                <span className="absolute right-2 top-2 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white capitalize backdrop-blur-md">
                  {item.priority}
                </span>
              </div>

              <div className="mt-2 px-0.5">
                <p className="truncate text-sm font-medium text-white">{item.name}</p>
                <p className="text-xs text-white/45">{item.category}</p>
                {item.price && (
                  <p className="mt-0.5 text-sm font-semibold text-white">{formatCurrency(item.price)}</p>
                )}
                {item.notes && (
                  <p className="mt-1 line-clamp-2 text-xs text-white/45">{item.notes}</p>
                )}
                <div className="mt-2 flex gap-1.5">
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="secondary" className="gap-1.5 text-xs px-2.5 py-1">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Shop
                      </Button>
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs px-2.5 py-1"
                    onClick={() => updateItem("wishlist", item.id, { purchased: true })}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Got it
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mastical-glass flex flex-col items-center justify-center rounded-lg py-16 text-center">
          <Heart className="h-10 w-10 text-cyan-100/70" />
          <p className="mt-4 font-semibold text-white">Nothing saved yet</p>
          <p className="mt-1 max-w-xs text-sm text-white/52">Build a shortlist of pieces worth considering.</p>
          <Button className="mt-6" onClick={() => setOpen(true)}>Add first wish</Button>
        </div>
      )}

      {/* Purchased */}
      {purchased.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/52">Purchased</h2>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
            {purchased.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3">
                <Check className="h-4 w-4 shrink-0 text-cyan-100/70" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white/52 line-through">{item.name}</p>
                  <p className="text-xs text-white/35">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddWishlistModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-3">
      <p className="text-lg font-semibold leading-none text-white">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/38">{label}</p>
    </div>
  );
}
