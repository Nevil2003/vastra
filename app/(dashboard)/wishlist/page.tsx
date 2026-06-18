"use client";

import { FormEvent, useState } from "react";
import { Check, ExternalLink, Heart, Plus } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
    setForm((current) => ({ ...current, [name]: value }));
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

  const active = items.filter((item) => !item.purchased);
  const purchased = items.filter((item) => item.purchased);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#3C3489]">Wishlist</p>
          <h1 className="font-serif text-4xl font-semibold text-[#17152D]">Shop with memory</h1>
          <p className="mt-2 text-[#5F596B]">Save links, prices, priorities, and pieces you want to compare later.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add wish</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {active.map((item) => (
          <Card key={item.id} hover>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#EFE6D8]">
              {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" /> : <div className="flex h-full items-center justify-center"><Heart className="h-10 w-10 text-[#3C3489]/35" /></div>}
            </div>
            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#17152D]">{item.name}</h3>
                  <p className="text-sm text-[#857C73]">{item.category} · {item.priority} priority</p>
                </div>
                {item.price ? <span className="font-semibold text-[#3C3489]">{formatCurrency(item.price)}</span> : null}
              </div>
              {item.notes ? <p className="mt-3 text-sm text-[#5F596B]">{item.notes}</p> : null}
              <div className="mt-4 flex gap-2">
                {item.url ? <a href={item.url} target="_blank" rel="noreferrer"><Button size="sm" variant="outline" className="gap-2"><ExternalLink className="h-4 w-4" /> Open</Button></a> : null}
                <Button size="sm" onClick={() => updateItem<WishlistItem>("wishlist", item.id, { purchased: true })} className="gap-2"><Check className="h-4 w-4" /> Purchased</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {active.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#D2C1AD] bg-[#FFFDF8] p-12 text-center">
          <h3 className="font-serif text-2xl font-semibold text-[#17152D]">No active wishlist yet</h3>
          <p className="mt-2 text-[#5F596B]">Save pieces before buying so shopping stays intentional.</p>
        </div>
      ) : null}

      {purchased.length > 0 && (
        <Card>
          <CardTitle>Purchased</CardTitle>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {purchased.map((item) => <div key={item.id} className="rounded-xl bg-[#F8F3EA] p-3 text-sm text-[#5F596B]">{item.name}</div>)}
          </CardContent>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add wishlist item">
        <form onSubmit={submit} className="space-y-3">
          <Input required placeholder="Item name" value={form.name} onChange={(e) => setField("name", e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={form.category} onChange={(e) => setField("category", e.target.value)}>
              {categories.map((category) => <option key={category}>{category}</option>)}
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
          <Button type="submit" className="w-full">Save wish</Button>
        </form>
      </Modal>
    </div>
  );
}
