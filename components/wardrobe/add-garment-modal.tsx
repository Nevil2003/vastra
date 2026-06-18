"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { createItem } from "@/lib/firestore";
import { uploadUserImage } from "@/lib/storage";
import { Garment, GarmentCategory, StitchingStatus } from "@/types";

const categories: GarmentCategory[] = ["Top", "Bottom", "Dress", "Saree", "Kurta", "Lehenga", "Suit", "Outerwear", "Shoes", "Accessory", "Fabric", "Beauty"];
const stitchingStatuses: StitchingStatus[] = ["not-needed", "to-stitch", "with-tailor", "trial", "ready", "delivered"];

export function AddGarmentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "Top" as GarmentCategory,
    color: "#3C3489",
    colorName: "Indigo",
    brand: "",
    size: "",
    fabric: "",
    occasion: "",
    season: "all-season",
    price: "",
    notes: "",
    tailorName: "",
    tailorPhone: "",
    stitchingStatus: "not-needed" as StitchingStatus,
    stitchingDueDate: "",
    stitchingPrice: "",
  });

  function setField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const imageUrl = file ? await uploadUserImage(user.uid, "garments", file) : undefined;
      await createItem<Omit<Garment, "id" | "createdAt" | "updatedAt">>("garments", {
        userId: user.uid,
        name: form.name,
        category: form.category,
        color: form.color,
        colorName: form.colorName,
        imageUrl,
        brand: form.brand,
        size: form.size,
        fabric: form.fabric,
        occasion: form.occasion,
        season: form.season,
        price: form.price ? Number(form.price) : undefined,
        wearCount: 0,
        notes: form.notes,
        tailorName: form.tailorName,
        tailorPhone: form.tailorPhone,
        stitchingStatus: form.stitchingStatus,
        stitchingDueDate: form.stitchingDueDate,
        stitchingPrice: form.stitchingPrice ? Number(form.stitchingPrice) : undefined,
        measurements: {},
      });
      onClose();
      setForm((current) => ({ ...current, name: "", brand: "", size: "", fabric: "", price: "", notes: "" }));
      setFile(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add wardrobe item">
      <form onSubmit={submit} className="space-y-4">
        <Input required placeholder="Item name" value={form.name} onChange={(e) => setField("name", e.target.value)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Select value={form.category} onChange={(e) => setField("category", e.target.value)}>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </Select>
          <Input placeholder="Color name" value={form.colorName} onChange={(e) => setField("colorName", e.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
          <Input type="color" value={form.color} onChange={(e) => setField("color", e.target.value)} className="h-11 p-1" />
          <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Brand or boutique" value={form.brand} onChange={(e) => setField("brand", e.target.value)} />
          <Input placeholder="Size" value={form.size} onChange={(e) => setField("size", e.target.value)} />
          <Input placeholder="Fabric" value={form.fabric} onChange={(e) => setField("fabric", e.target.value)} />
          <Input placeholder="Occasion" value={form.occasion} onChange={(e) => setField("occasion", e.target.value)} />
          <Input placeholder="Season" value={form.season} onChange={(e) => setField("season", e.target.value)} />
          <Input type="number" min="0" placeholder="Price" value={form.price} onChange={(e) => setField("price", e.target.value)} />
        </div>
        <div className="rounded-2xl border border-[#E5DACB] bg-[#F8F3EA] p-4">
          <p className="mb-3 text-sm font-semibold text-[#17152D]">Stitching / alteration</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={form.stitchingStatus} onChange={(e) => setField("stitchingStatus", e.target.value)}>
              {stitchingStatuses.map((status) => <option key={status} value={status}>{status.replace("-", " ")}</option>)}
            </Select>
            <Input type="date" value={form.stitchingDueDate} onChange={(e) => setField("stitchingDueDate", e.target.value)} />
            <Input placeholder="Tailor name" value={form.tailorName} onChange={(e) => setField("tailorName", e.target.value)} />
            <Input placeholder="Tailor phone" value={form.tailorPhone} onChange={(e) => setField("tailorPhone", e.target.value)} />
            <Input type="number" min="0" placeholder="Stitching price" value={form.stitchingPrice} onChange={(e) => setField("stitchingPrice", e.target.value)} />
          </div>
        </div>
        <Input placeholder="Notes" value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
        <Button type="submit" className="w-full" isLoading={loading}>Save item</Button>
      </form>
    </Modal>
  );
}
