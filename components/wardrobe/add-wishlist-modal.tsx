"use client";

import { ChangeEvent, ElementType, FormEvent, useState } from "react";
import {
  Briefcase, Camera, Crown, Gem, Layers, Link2,
  Palette, Scissors, Search, Shirt, Sparkles, Star, Wind, X,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ImageSelection, SearchOverlay } from "@/components/wardrobe/search-overlay";
import { indianBrands } from "@/lib/brand-data";
import { createItem } from "@/lib/firestore";
import { uploadUserImage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { GarmentCategory, WishlistItem } from "@/types";

const CATEGORIES: { name: GarmentCategory; icon: ElementType }[] = [
  { name: "Top",       icon: Shirt },
  { name: "Bottom",    icon: Layers },
  { name: "Dress",     icon: Sparkles },
  { name: "Saree",     icon: Star },
  { name: "Kurta",     icon: Shirt },
  { name: "Lehenga",   icon: Crown },
  { name: "Suit",      icon: Briefcase },
  { name: "Outerwear", icon: Wind },
  { name: "Shoes",     icon: Gem },
  { name: "Accessory", icon: Star },
  { name: "Fabric",    icon: Scissors },
  { name: "Beauty",    icon: Palette },
];

const PRIORITIES: { value: WishlistItem["priority"]; label: string; color: string }[] = [
  { value: "low",    label: "Low",    color: "text-[#888888]" },
  { value: "medium", label: "Medium", color: "text-[#F59E0B]" },
  { value: "high",   label: "High",   color: "text-[#EF4444]" },
];

type ImageMode = "photo" | "search" | "url";

export function AddWishlistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageMode, setImageMode] = useState<ImageMode>("photo");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayMode, setOverlayMode] = useState<"search" | "url">("search");

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [externalImageUrl, setExternalImageUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "Top" as GarmentCategory,
    priority: "medium" as WishlistItem["priority"],
    brand: "",
    price: "",
    originalPrice: "",
    url: "",
    notes: "",
  });

  function setField(name: string, value: string) {
    setForm((c) => ({ ...c, [name]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setFilePreview(f ? URL.createObjectURL(f) : null);
  }

  function openOverlay(mode: "search" | "url") {
    setOverlayMode(mode);
    setOverlayOpen(true);
  }

  function handleOverlaySelect(sel: ImageSelection) {
    setExternalImageUrl(sel.imageUrl);
    setError("");
    setForm((c) => ({
      ...c,
      name:  c.name  || sel.name  || "",
      price: c.price || sel.price || "",
      url:   c.url   || sel.sourceUrl || "",
    }));
    setOverlayOpen(false);
  }

  function clearImage() {
    setFile(null);
    setFilePreview(null);
    setExternalImageUrl(null);
  }

  function reset() {
    clearImage();
    setImageMode("photo");
    setOverlayOpen(false);
    setError("");
    setForm({
      name: "",
      category: "Top",
      priority: "medium",
      brand: "",
      price: "",
      originalPrice: "",
      url: "",
      notes: "",
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Item name is required"); return; }
    if (!user) { setError("You must be signed in"); return; }
    setLoading(true);
    try {
      let imageUrl: string | undefined;
      if (imageMode === "photo" && file) {
        imageUrl = await uploadUserImage(user.uid, "wishlist", file);
      } else if (externalImageUrl) {
        imageUrl = externalImageUrl;
      }

      await createItem<Omit<WishlistItem, "id" | "createdAt" | "updatedAt">>("wishlist", {
        userId: user.uid,
        name: form.name.trim(),
        category: form.category,
        brand: form.brand || undefined,
        imageUrl,
        url: form.url || undefined,
        price: form.price ? Number(form.price) : undefined,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        saleStatus: form.brand ? "watching" : undefined,
        lastCheckedAt: form.brand ? new Date().toISOString() : undefined,
        priority: form.priority,
        notes: form.notes || undefined,
        purchased: false,
      });
      onClose();
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Modal open={open} onClose={() => { onClose(); reset(); }} title="Add to wishlist">
        <form onSubmit={submit} className="space-y-5">

          {/* Name */}
          <Input
            placeholder="Item name *"
            value={form.name}
            onChange={(e) => { setField("name", e.target.value); setError(""); }}
          />

          {/* Category */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888]">Category</p>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(({ name, icon: Icon }, i) => {
                const active = form.category === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setField("category", name)}
                    style={{ animationDelay: `${i * 20}ms` }}
                    className={cn(
                      "animate-rise flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-[10px] font-medium leading-none transition-all duration-200",
                      active
                        ? "bg-[#111111] text-white shadow-sm scale-[1.04]"
                        : "border border-[#E8E8E8] bg-white text-[#888888] hover:border-[#AAAAAA] hover:text-[#111111] hover:scale-[1.03]"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 transition-transform duration-200", active && "scale-110")} />
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888]">Priority</p>
            <div className="flex gap-2">
              {PRIORITIES.map(({ value, label, color }) => {
                const active = form.priority === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setField("priority", value)}
                    className={cn(
                      "flex-1 rounded-xl py-3 text-sm font-semibold transition-all duration-200",
                      active
                        ? "bg-[#111111] text-white scale-[1.03] shadow-sm"
                        : `border border-[#E8E8E8] bg-white ${color} hover:border-[#AAAAAA] hover:scale-[1.02]`
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image source */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888]">Photo</p>
            <div className="flex rounded-xl border border-[#E8E8E8] bg-[#F8F8F8] p-1 gap-1">
              {([
                { key: "photo" as ImageMode, icon: Camera, label: "Upload" },
                { key: "search" as ImageMode, icon: Search, label: "Search" },
                { key: "url" as ImageMode, icon: Link2, label: "URL" },
              ]).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setImageMode(key)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all duration-200",
                    imageMode === key
                      ? "bg-white text-[#111111] shadow-sm"
                      : "text-[#AAAAAA] hover:text-[#111111]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-3">
              {/* Photo */}
              {imageMode === "photo" && (
                <div className="animate-rise">
                  {filePreview ? (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={filePreview} alt="Preview" className="h-full w-full object-cover" />
                      <button type="button" onClick={clearImage} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E8E8E8] py-10 text-sm text-[#AAAAAA] transition-colors hover:border-[#CCCCCC] hover:text-[#888888]">
                      <Camera className="h-8 w-8" />
                      <span>Tap to choose a photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              )}

              {/* Search */}
              {imageMode === "search" && (
                <div className="animate-rise">
                  {externalImageUrl ? (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#F5F5F5]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={externalImageUrl} alt="Selected" className="h-full w-full object-cover" />
                      <button type="button" onClick={clearImage} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => openOverlay("search")}
                      className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-[#E8E8E8] px-5 py-8 text-sm text-[#AAAAAA] transition-colors hover:border-[#CCCCCC] hover:text-[#888888]">
                      <Search className="h-5 w-5" />
                      <span>Search for an image…</span>
                    </button>
                  )}
                </div>
              )}

              {/* URL */}
              {imageMode === "url" && (
                <div className="animate-rise">
                  {externalImageUrl ? (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#F5F5F5]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={externalImageUrl} alt="URL preview" className="h-full w-full object-cover" />
                      <button type="button" onClick={clearImage} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => openOverlay("url")}
                      className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-[#E8E8E8] px-5 py-8 text-sm text-[#AAAAAA] transition-colors hover:border-[#CCCCCC] hover:text-[#888888]">
                      <Link2 className="h-5 w-5" />
                      <span>Paste a product page URL…</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={form.brand}
              onChange={(e) => setField("brand", e.target.value)}
              className="h-11 rounded-xl border border-[#E8E8E8] bg-white px-3 text-sm text-[#111111] outline-none transition focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/10"
            >
              <option value="">Brand to track</option>
              {indianBrands.map((brand) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>
            <Input type="number" min="0" placeholder="Price" value={form.price} onChange={(e) => setField("price", e.target.value)} />
            <Input type="number" min="0" placeholder="Original price" value={form.originalPrice} onChange={(e) => setField("originalPrice", e.target.value)} />
            <Input placeholder="Product URL (shop link)" value={form.url} onChange={(e) => setField("url", e.target.value)} />
          </div>
          <Input placeholder="Notes" value={form.notes} onChange={(e) => setField("notes", e.target.value)} />

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
          )}
          <Button type="submit" className="w-full" isLoading={loading}>
            Save to wishlist
          </Button>
        </form>
      </Modal>

      <SearchOverlay
        open={overlayOpen}
        mode={overlayMode}
        onClose={() => setOverlayOpen(false)}
        onSelect={handleOverlaySelect}
      />
    </>
  );
}
