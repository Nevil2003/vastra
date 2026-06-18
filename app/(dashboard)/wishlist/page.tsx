"use client";

import { FormEvent, useState } from "react";
import { Check, ExternalLink, Heart, Plus } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { createItem, updateItem } from "@/lib/firestore";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { uploadUserImage } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { GarmentCategory, WishlistItem } from "@/types";

const categories: GarmentCategory[] = ["Top", "Bottom", "Dress", "Saree", "Kurta", "Lehenga", "Suit", "Outerwear", "Shoes", "Accessory", "Fabric", "Beauty"];

export default function WishlistPage() {
  const { user } = useAuth();
  const { items } = useUserCollection<WishlistItem>("wishlist");
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", category: "Top" as GarmentCategory, url: "", price: "", priority: "medium", notes: "" });

  function setField(name: string, value: string) {
    setForm((c) => ({ ...c, [name]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const imageUrl = file ? await uploadUserImage(user.uid, "wishlist", file) : undefined;
    await createItem<Omit<WishlistItem, "id" | "createdAt" | "updatedAt">>("wishlist", {
      userId: user.uid,
      name: form.name,
      category: form.category,
      url: form.url,
      imageUrl,
      price: form.price ? Number(form.price) : undefined,
      priority: form.priority as WishlistItem["priority"],
      notes: form.notes,
      purchased: false,
    });
    setOpen(false);
    setFile(null);
    setForm({ name: "", category: "Top", url: "", price: "", priority: "medium", notes: "" });
  }

  const active = items.filter((i) => !i.purchased);
  const purchased = items.filter((i) => i.purchased);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Wishlist</h1>
          <p className="mt-0.5 text-sm text-[#888888]">{active.length} items saved</p>
        </div>
        <Button onClick={() => setOpen(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add wish
        </Button>
      </div>

      {/* Active wishlist grid */}
      {active.length > 0 ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {active.map((item) => (
            <div key={item.id} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#F5F5F5]">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Heart className="h-10 w-10 text-[#D0D0D0]" />
                  </div>
                )}
                {/* Priority badge */}
                <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[#111111] capitalize shadow-sm">
                  {item.priority}
                </span>
              </div>

              <div className="mt-2 px-0.5">
                <p className="truncate text-sm font-medium text-[#111111]">{item.name}</p>
                <p className="text-xs text-[#888888]">{item.category}</p>
                {item.price && (
                  <p className="mt-0.5 text-sm font-semibold text-[#111111]">{formatCurrency(item.price)}</p>
                )}
                {item.notes && (
                  <p className="mt-1 text-xs text-[#888888] line-clamp-2">{item.notes}</p>
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
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#E8E8E8] bg-white py-20 text-center">
          <Heart className="h-10 w-10 text-[#E0E0E0]" />
          <p className="mt-4 font-semibold text-[#111111]">Nothing saved yet</p>
          <p className="mt-1 text-sm text-[#888888]">Save pieces before buying so shopping stays intentional</p>
          <Button className="mt-6" onClick={() => setOpen(true)}>Add first wish</Button>
        </div>
      )}

      {/* Purchased */}
      {purchased.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#888888] uppercase tracking-wider">Purchased</h2>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
            {purchased.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#E8E8E8] bg-white px-4 py-3">
                <Check className="h-4 w-4 shrink-0 text-[#888888]" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#888888] line-through">{item.name}</p>
                  <p className="text-xs text-[#AAAAAA]">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add to wishlist">
        <form onSubmit={submit} className="space-y-3">
          <Input required placeholder="Item name" value={form.name} onChange={(e) => setField("name", e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={form.category} onChange={(e) => setField("category", e.target.value)}>
              {categories.map((cat) => <option key={cat}>{cat}</option>)}
            </Select>
            <Select value={form.priority} onChange={(e) => setField("priority", e.target.value)}>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </Select>
          </div>
          <Input placeholder="Product URL" value={form.url} onChange={(e) => setField("url", e.target.value)} />
          <Input type="number" min="0" placeholder="Price" value={form.price} onChange={(e) => setField("price", e.target.value)} />
          <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Input placeholder="Notes" value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
          <Button type="submit" className="w-full">Save to wishlist</Button>
        </form>
      </Modal>
    </div>
  );
}
