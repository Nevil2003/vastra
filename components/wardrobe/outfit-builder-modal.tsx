"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Briefcase, Check, Crown, Gem, Heart, Layers,
  Plus, Search, Shirt, Sparkles, Wind, X,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createItem, updateItem } from "@/lib/firestore";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { cn } from "@/lib/utils";
import {
  Garment, GarmentCategory, Outfit, OutfitSlotKey, WeatherTag,
} from "@/types";

// ─── Slot config ─────────────────────────────────────────────────────────────

type SlotCfg = {
  key: OutfitSlotKey;
  label: string;
  categories: GarmentCategory[];
  Icon: React.ElementType;
};

const SLOT_CFG: SlotCfg[] = [
  { key: "top",       label: "Top",         categories: ["Top", "Kurta"],                     Icon: Shirt    },
  { key: "bottom",    label: "Bottom",      categories: ["Bottom"],                            Icon: Layers   },
  { key: "dress",     label: "Dress / Full",categories: ["Dress", "Saree", "Lehenga", "Suit"],Icon: Sparkles },
  { key: "outerwear", label: "Outerwear",   categories: ["Outerwear"],                         Icon: Wind     },
  { key: "shoes",     label: "Shoes",       categories: ["Shoes"],                             Icon: Gem      },
  { key: "bag",       label: "Bag",         categories: ["Accessory"],                         Icon: Briefcase},
  { key: "accessory", label: "Accessory",   categories: ["Accessory", "Beauty"],               Icon: Crown    },
];

const OCCASIONS = ["Casual", "Work", "Party", "Date", "Travel", "Formal", "Wedding", "Gym"];
const SEASONS   = ["Spring", "Summer", "Autumn", "Winter", "All Season"];
const WEATHER_OPTS: { value: WeatherTag; label: string }[] = [
  { value: "hot",  label: "Hot" },
  { value: "cold", label: "Cold" },
  { value: "rain", label: "Rain" },
  { value: "wind", label: "Windy" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pass an existing outfit to edit it */
  outfit?: Outfit;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OutfitBuilderModal({ open, onClose, outfit }: Props) {
  const { user } = useAuth();
  const { items: garments } = useUserCollection<Garment>("garments");

  // Slots: slotKey → garmentId
  const [slots, setSlots] = useState<Partial<Record<OutfitSlotKey, string>>>(outfit?.slots ?? {});
  const [name, setName]         = useState(outfit?.name ?? "");
  const [occasion, setOccasion] = useState(outfit?.occasion ?? "");
  const [season, setSeason]     = useState(outfit?.season ?? "");
  const [weather, setWeather]   = useState<WeatherTag[]>(outfit?.weatherTags ?? []);
  const [notes, setNotes]       = useState(outfit?.notes ?? "");
  const [favorite, setFavorite] = useState(outfit?.favorite ?? false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Picker state
  const [pickerSlot, setPickerSlot]       = useState<OutfitSlotKey | null>(null);
  const [pickerSearch, setPickerSearch]   = useState("");

  const garmentMap = useMemo(
    () => new Map(garments.map((g) => [g.id, g])),
    [garments]
  );

  if (!open) return null;

  // Garments shown in picker (filtered by slot categories + search)
  const slotCfg = SLOT_CFG.find((s) => s.key === pickerSlot);
  const pickerGarments = pickerSlot
    ? garments.filter((g) => {
        const inCategory = slotCfg?.categories.includes(g.category);
        const q = pickerSearch.toLowerCase();
        const matchesSearch = !q || g.name.toLowerCase().includes(q) || g.brand?.toLowerCase().includes(q);
        return inCategory && matchesSearch;
      })
    : [];

  function selectSlot(slotKey: OutfitSlotKey, garmentId: string) {
    setSlots((s) => ({ ...s, [slotKey]: garmentId }));
    setPickerSlot(null);
    setPickerSearch("");
  }

  function clearSlot(slotKey: OutfitSlotKey) {
    setSlots((s) => { const n = { ...s }; delete n[slotKey]; return n; });
  }

  function toggleWeather(tag: WeatherTag) {
    setWeather((w) => w.includes(tag) ? w.filter((t) => t !== tag) : [...w, tag]);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    const garmentIds = Object.values(slots).filter((id): id is string => Boolean(id));
    if (!name.trim()) { setError("Outfit name is required"); return; }
    if (garmentIds.length === 0) { setError("Add at least one item to the outfit"); return; }
    if (!user) return;
    setLoading(true);
    try {
      const data = {
        userId: user.uid,
        name: name.trim(),
        garmentIds,
        slots,
        occasion: occasion || undefined,
        season: season || undefined,
        weatherTags: weather.length ? weather : undefined,
        notes: notes || undefined,
        favorite,
        wornCount: outfit?.wornCount ?? 0,
        lastWorn: outfit?.lastWorn,
      };
      if (outfit) {
        await updateItem("outfits", outfit.id, data);
      } else {
        await createItem("outfits", { ...data });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save outfit");
    } finally {
      setLoading(false);
    }
  }

  // Count filled slots
  const filledCount = Object.values(slots).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white overflow-hidden">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#E8E8E8] px-4 py-3">
        <button
          onClick={onClose}
          className="rounded-full p-2 text-[#888888] transition hover:bg-[#F5F5F5] hover:text-[#111111]"
        >
          <X className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-[#111111]">
          {outfit ? "Edit Outfit" : "Build Outfit"}
        </h1>
        <button
          onClick={favorite ? () => setFavorite(false) : () => setFavorite(true)}
          className="rounded-full p-2 transition hover:bg-[#F5F5F5]"
          aria-label="Favourite"
        >
          <Heart
            className={cn("h-5 w-5 transition", favorite ? "fill-[#EF4444] text-[#EF4444]" : "text-[#CCCCCC]")}
          />
        </button>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <form id="outfit-form" onSubmit={save} className="space-y-6 px-4 py-5">

          {/* Name */}
          <Input
            placeholder="Outfit name *"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
          />

          {/* Slot canvas */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#888888]">
              Items · {filledCount} selected
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {SLOT_CFG.map(({ key, label, Icon }) => {
                const gId = slots[key];
                const garment = gId ? garmentMap.get(gId) : undefined;
                return (
                  <div key={key} className="relative">
                    <button
                      type="button"
                      onClick={() => { setPickerSlot(key); setPickerSearch(""); }}
                      className={cn(
                        "group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 transition-all duration-200",
                        garment
                          ? "border-[#111111] bg-[#F8F8F8]"
                          : "border-dashed border-[#E0E0E0] bg-[#FAFAFA] hover:border-[#AAAAAA] hover:bg-[#F5F5F5]",
                        "aspect-[3/4]"
                      )}
                    >
                      {garment ? (
                        garment.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={garment.imageUrl}
                            alt={garment.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#F5F5F5]">
                            <div
                              className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                              style={{ background: garment.color }}
                            />
                            <span className="max-w-[90%] truncate px-1 text-center text-[10px] font-medium text-[#111111]">
                              {garment.name}
                            </span>
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 p-3 text-[#BBBBBB] group-hover:text-[#888888] transition-colors">
                          <Icon className="h-6 w-6" />
                          <span className="text-[10px] font-medium">{label}</span>
                          <Plus className="h-3.5 w-3.5 opacity-60" />
                        </div>
                      )}
                    </button>

                    {/* Remove button */}
                    {garment && (
                      <button
                        type="button"
                        onClick={() => clearSlot(key)}
                        className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}

                    {/* Slot label below */}
                    {garment && (
                      <p className="mt-1 truncate text-center text-[10px] font-medium text-[#888888]">
                        {garment.name}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Occasion chips */}
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888]">Occasion</p>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOccasion(occasion === o ? "" : o)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    occasion === o
                      ? "bg-[#111111] text-white"
                      : "bg-[#F3F3F3] text-[#888888] hover:bg-[#EBEBEB]"
                  )}
                >
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
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeason(season === s ? "" : s)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    season === s
                      ? "bg-[#111111] text-white"
                      : "bg-[#F3F3F3] text-[#888888] hover:bg-[#EBEBEB]"
                  )}
                >
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
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleWeather(value)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    weather.includes(value)
                      ? "bg-[#111111] text-white"
                      : "bg-[#F3F3F3] text-[#888888] hover:bg-[#EBEBEB]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <Input
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Error */}
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
          )}
        </form>
      </div>

      {/* ── Sticky save button ───────────────────────────────────────── */}
      <div className="shrink-0 border-t border-[#E8E8E8] bg-white px-4 py-3 pb-safe">
        <Button type="submit" form="outfit-form" className="w-full" isLoading={loading}>
          {outfit ? "Save Changes" : "Save Outfit"}
        </Button>
      </div>

      {/* ── Garment Picker Sheet ─────────────────────────────────────── */}
      {pickerSlot && (
        <div className="fixed inset-0 z-[70] flex flex-col">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40"
            onClick={() => { setPickerSlot(null); setPickerSearch(""); }}
          />

          {/* Sheet */}
          <div className="flex max-h-[75vh] flex-col rounded-t-3xl bg-white shadow-2xl">
            {/* Sheet header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#E8E8E8] px-4 py-3">
              <h2 className="text-sm font-bold text-[#111111]">
                Select {SLOT_CFG.find((s) => s.key === pickerSlot)?.label}
              </h2>
              <button
                onClick={() => { setPickerSlot(null); setPickerSearch(""); }}
                className="rounded-full p-1.5 text-[#888888] transition hover:bg-[#F5F5F5]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div className="shrink-0 px-4 pb-2 pt-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#AAAAAA]" />
                <input
                  autoFocus
                  className="w-full rounded-xl border border-[#EEEEEE] bg-[#F8F8F8] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#111111] focus:bg-white transition-all"
                  placeholder="Search…"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Remove current selection */}
            {slots[pickerSlot] && (
              <div className="shrink-0 px-4 pb-2">
                <button
                  type="button"
                  onClick={() => { clearSlot(pickerSlot); setPickerSlot(null); setPickerSearch(""); }}
                  className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="h-3.5 w-3.5" /> Remove from outfit
                </button>
              </div>
            )}

            {/* Garment grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {pickerGarments.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Shirt className="h-10 w-10 text-[#E0E0E0]" />
                  <p className="text-sm text-[#AAAAAA]">
                    {pickerSearch
                      ? "No matches found"
                      : `No ${SLOT_CFG.find((s) => s.key === pickerSlot)?.label.toLowerCase()} items in your closet`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                  {pickerGarments.map((g) => {
                    const isSelected = slots[pickerSlot!] === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => selectSlot(pickerSlot!, g.id)}
                        className={cn(
                          "group relative w-full overflow-hidden rounded-xl transition-all duration-150",
                          isSelected && "ring-2 ring-[#111111] ring-offset-2"
                        )}
                      >
                        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#F5F5F5]">
                          {g.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={g.imageUrl}
                              alt={g.name}
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <div
                                className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                                style={{ background: g.color }}
                              />
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                                <Check className="h-4 w-4 text-[#111111]" />
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="mt-1 truncate text-center text-[10px] font-medium text-[#111111]">
                          {g.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
