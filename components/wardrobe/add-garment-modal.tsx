"use client";

import { ChangeEvent, ElementType, FormEvent, useEffect, useState } from "react";
import {
  Briefcase, Camera, Crown, Gem, Layers, Link2,
  Palette, Scissors, Search, Shirt, Sparkles, Star, Wind, X,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { ImageSelection, SearchOverlay } from "@/components/wardrobe/search-overlay";
import { createItem, updateItem } from "@/lib/firestore";
import { uploadUserImage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import {
  Garment, GarmentCategory, GarmentCondition, GarmentTag,
  StitchingStatus, WeatherTag,
} from "@/types";

// ─── Static config ────────────────────────────────────────────────────────────

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

const STITCHING_STATUSES: StitchingStatus[] = [
  "not-needed", "to-stitch", "with-tailor", "trial", "ready", "delivered",
];

const SEASONS = ["Spring", "Summer", "Autumn", "Winter", "All Season"];
const OCCASIONS = ["Casual", "Work", "Party", "Date", "Travel", "Formal", "Wedding", "Gym"];
const WEATHER_OPTS: { value: WeatherTag; label: string }[] = [
  { value: "hot",  label: "Hot" },
  { value: "cold", label: "Cold" },
  { value: "rain", label: "Rain" },
  { value: "wind", label: "Windy" },
];
const CONDITION_OPTS: GarmentCondition[] = ["new", "excellent", "good", "fair", "poor"];
const TAG_OPTS: { value: GarmentTag; label: string }[] = [
  { value: "favorite",         label: "Favourite" },
  { value: "rarely-worn",      label: "Rarely worn" },
  { value: "donate-maybe",     label: "Donate?" },
  { value: "needs-alteration", label: "Needs alteration" },
  { value: "sentimental",      label: "Sentimental" },
];

type ImageMode = "photo" | "search" | "url";

interface FormState {
  name: string;
  category: GarmentCategory;
  subcategory: string;
  color: string;
  colorName: string;
  brand: string;
  size: string;
  fabric: string;
  occasion: string;
  season: string;
  price: string;
  purchaseDate: string;
  condition: string;
  notes: string;
  stitchingStatus: StitchingStatus;
}

const BLANK_FORM: FormState = {
  name: "", category: "Top", subcategory: "", color: "#111111", colorName: "",
  brand: "", size: "", fabric: "", occasion: "", season: "", price: "",
  purchaseDate: "", condition: "", notes: "", stitchingStatus: "not-needed",
};

function garmentToForm(g: Garment): FormState {
  return {
    name:            g.name,
    category:        g.category,
    subcategory:     g.subcategory ?? "",
    color:           g.color,
    colorName:       g.colorName ?? "",
    brand:           g.brand ?? "",
    size:            g.size ?? "",
    fabric:          g.fabric ?? "",
    occasion:        g.occasion ?? "",
    season:          g.season ?? "",
    price:           g.price?.toString() ?? "",
    purchaseDate:    g.purchaseDate ?? "",
    condition:       g.condition ?? "",
    notes:           g.notes ?? "",
    stitchingStatus: g.stitchingStatus ?? "not-needed",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pass an existing garment to open in edit mode */
  editGarment?: Garment;
}

export function AddGarmentModal({ open, onClose, editGarment }: Props) {
  const { user } = useAuth();
  const isEdit = Boolean(editGarment);

  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [imageMode, setImageMode]   = useState<ImageMode>("photo");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayMode, setOverlayMode] = useState<"search" | "url">("search");

  const [file, setFile]                   = useState<File | null>(null);
  const [filePreview, setFilePreview]     = useState<string | null>(null);
  const [externalImageUrl, setExternalImageUrl] = useState<string | null>(null);

  const [form, setForm]               = useState<FormState>(BLANK_FORM);
  const [weatherTags, setWeatherTags] = useState<WeatherTag[]>([]);
  const [tags, setTags]               = useState<GarmentTag[]>([]);

  // Reset / pre-fill when modal opens or switches edit target
  useEffect(() => {
    if (!open) return;
    if (editGarment) {
      setForm(garmentToForm(editGarment));
      setWeatherTags(editGarment.weatherTags ?? []);
      setTags(editGarment.tags ?? []);
      if (editGarment.imageUrl) {
        setExternalImageUrl(editGarment.imageUrl);
        setImageMode("url");
      } else {
        setExternalImageUrl(null);
        setImageMode("photo");
      }
    } else {
      setForm(BLANK_FORM);
      setWeatherTags([]);
      setTags([]);
      setExternalImageUrl(null);
      setImageMode("photo");
    }
    setFile(null);
    setFilePreview(null);
    setError("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editGarment?.id]);

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

  async function handleOverlaySelect(selections: ImageSelection[]) {
    setOverlayOpen(false);

    if (selections.length === 1) {
      // Single: fill the form so the user can complete the details
      const sel = selections[0];
      setExternalImageUrl(sel.imageUrl);
      setImageMode("url");
      setError("");
      setForm((c) => ({
        ...c,
        name:  c.name  || sel.name  || "",
        brand: c.brand || sel.brand || "",
        price: c.price || sel.price || "",
      }));
    } else {
      // Multiple: batch-create all immediately with auto-detected data
      if (!user) return;
      setLoading(true);
      setError("");
      try {
        await Promise.all(
          selections.map((sel) =>
            createItem<Omit<Garment, "id" | "createdAt" | "updatedAt">>("garments", {
              userId:          user.uid,
              name:            sel.name || form.category,
              category:        form.category,
              imageUrl:        sel.imageUrl,
              brand:           sel.brand || undefined,
              price:           sel.price ? Number(sel.price) : undefined,
              color:           "#111111",
              colorName:       form.category,
              wearCount:       0,
              stitchingStatus: "not-needed",
              measurements:    {},
            })
          )
        );
        onClose();
        reset();
      } catch {
        setError("Some items could not be added. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  }

  function clearImage() {
    setFile(null);
    setFilePreview(null);
    setExternalImageUrl(null);
  }

  function toggleWeather(tag: WeatherTag) {
    setWeatherTags((w) => w.includes(tag) ? w.filter((t) => t !== tag) : [...w, tag]);
  }

  function toggleTag(tag: GarmentTag) {
    setTags((t) => t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]);
  }

  function reset() {
    setForm(BLANK_FORM);
    setWeatherTags([]);
    setTags([]);
    setFile(null);
    setFilePreview(null);
    setExternalImageUrl(null);
    setImageMode("photo");
    setOverlayOpen(false);
    setError("");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Item name is required"); return; }
    if (!user) { setError("You must be signed in"); return; }
    setLoading(true);
    try {
      let imageUrl: string | undefined =
        externalImageUrl && imageMode !== "photo" ? externalImageUrl : undefined;

      if (imageMode === "photo" && file) {
        imageUrl = await uploadUserImage(user.uid, "garments", file);
      } else if (imageMode === "photo" && !file && editGarment?.imageUrl) {
        imageUrl = editGarment.imageUrl; // keep existing image
      } else if (externalImageUrl) {
        imageUrl = externalImageUrl;
      }

      const payload = {
        userId: user.uid,
        name:            form.name.trim(),
        category:        form.category,
        subcategory:     form.subcategory || undefined,
        color:           form.color,
        colorName:       form.colorName || form.color,
        imageUrl,
        brand:           form.brand || undefined,
        size:            form.size || undefined,
        fabric:          form.fabric || undefined,
        occasion:        form.occasion || undefined,
        season:          form.season || undefined,
        weatherTags:     weatherTags.length ? weatherTags : undefined,
        price:           form.price ? Number(form.price) : undefined,
        purchaseDate:    form.purchaseDate || undefined,
        condition:       (form.condition as GarmentCondition) || undefined,
        tags:            tags.length ? tags : undefined,
        notes:           form.notes || undefined,
        stitchingStatus: form.stitchingStatus,
        measurements:    editGarment?.measurements ?? {},
      };

      if (isEdit && editGarment) {
        await updateItem("garments", editGarment.id, payload);
      } else {
        await createItem<Omit<Garment, "id" | "createdAt" | "updatedAt">>("garments", {
          ...payload,
          wearCount: 0,
        });
      }
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
      <Modal
        open={open}
        onClose={() => { onClose(); reset(); }}
        title={isEdit ? "Edit item" : "Add to closet"}
      >
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

          {/* Image */}
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
                    imageMode === key ? "bg-white text-[#111111] shadow-sm" : "text-[#AAAAAA] hover:text-[#111111]"
                  )}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>

            <div className="mt-3">
              {imageMode === "photo" && (
                <div className="animate-rise">
                  {filePreview ? (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={filePreview} alt="Preview" className="h-full w-full object-cover" />
                      <button type="button" onClick={clearImage} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : externalImageUrl && isEdit ? (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#F5F5F5]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={externalImageUrl} alt="Current" className="h-full w-full object-cover" />
                      <button type="button" onClick={clearImage} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80">
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

              {imageMode === "search" && (
                <div className="animate-rise">
                  {externalImageUrl ? (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#F5F5F5]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={externalImageUrl} alt="Selected" className="h-full w-full object-cover" />
                      <button type="button" onClick={clearImage} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => openOverlay("search")}
                      className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-[#E8E8E8] px-5 py-8 text-sm text-[#AAAAAA] transition-colors hover:border-[#CCCCCC]">
                      <Search className="h-5 w-5" /> <span>Search for an image…</span>
                    </button>
                  )}
                </div>
              )}

              {imageMode === "url" && (
                <div className="animate-rise">
                  {externalImageUrl ? (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#F5F5F5]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={externalImageUrl} alt="URL preview" className="h-full w-full object-cover" />
                      <button type="button" onClick={clearImage} className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => openOverlay("url")}
                      className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-[#E8E8E8] px-5 py-8 text-sm text-[#AAAAAA] transition-colors hover:border-[#CCCCCC]">
                      <Link2 className="h-5 w-5" /> <span>Paste a product page URL…</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Core details */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Subcategory (e.g. T-Shirt)" value={form.subcategory} onChange={(e) => setField("subcategory", e.target.value)} />
            <Input placeholder="Brand" value={form.brand} onChange={(e) => setField("brand", e.target.value)} />
            <Input placeholder="Color name (e.g. Navy)" value={form.colorName} onChange={(e) => setField("colorName", e.target.value)} />
            <div className="flex items-center gap-2">
              <input type="color" value={form.color} onChange={(e) => setField("color", e.target.value)}
                className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[#E8E8E8] p-1" />
              <span className="text-xs text-[#888888]">Colour swatch</span>
            </div>
            <Input placeholder="Size" value={form.size} onChange={(e) => setField("size", e.target.value)} />
            <Input placeholder="Fabric" value={form.fabric} onChange={(e) => setField("fabric", e.target.value)} />
            <Input type="number" min="0" placeholder="Price (₹)" value={form.price} onChange={(e) => setField("price", e.target.value)} />
            <Input type="date" placeholder="Purchase date" value={form.purchaseDate} onChange={(e) => setField("purchaseDate", e.target.value)} />
          </div>

          {/* Occasion chips */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888]">Occasion</p>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((o) => (
                <button key={o} type="button" onClick={() => setField("occasion", form.occasion === o ? "" : o)}
                  className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    form.occasion === o ? "bg-[#111111] text-white" : "bg-[#F3F3F3] text-[#888888] hover:bg-[#EBEBEB]"
                  )}>
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Season chips */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888]">Season</p>
            <div className="flex flex-wrap gap-2">
              {SEASONS.map((s) => (
                <button key={s} type="button" onClick={() => setField("season", form.season === s ? "" : s)}
                  className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    form.season === s ? "bg-[#111111] text-white" : "bg-[#F3F3F3] text-[#888888] hover:bg-[#EBEBEB]"
                  )}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Weather tags */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888]">Weather</p>
            <div className="flex flex-wrap gap-2">
              {WEATHER_OPTS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => toggleWeather(value)}
                  className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    weatherTags.includes(value) ? "bg-[#111111] text-white" : "bg-[#F3F3F3] text-[#888888] hover:bg-[#EBEBEB]"
                  )}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888]">Condition</p>
            <div className="flex flex-wrap gap-2">
              {CONDITION_OPTS.map((c) => (
                <button key={c} type="button" onClick={() => setField("condition", form.condition === c ? "" : c)}
                  className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition-colors capitalize",
                    form.condition === c ? "bg-[#111111] text-white" : "bg-[#F3F3F3] text-[#888888] hover:bg-[#EBEBEB]"
                  )}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888]">Tags</p>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => toggleTag(value)}
                  className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    tags.includes(value) ? "bg-[#111111] text-white" : "bg-[#F3F3F3] text-[#888888] hover:bg-[#EBEBEB]"
                  )}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Stitching + notes */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={form.stitchingStatus} onChange={(e) => setField("stitchingStatus", e.target.value)}>
              {STITCHING_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/-/g, " ")}</option>
              ))}
            </Select>
          </div>
          <Input placeholder="Notes" value={form.notes} onChange={(e) => setField("notes", e.target.value)} />

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
          )}
          <Button type="submit" className="w-full" isLoading={loading}>
            {isEdit ? "Save changes" : "Add to closet"}
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
