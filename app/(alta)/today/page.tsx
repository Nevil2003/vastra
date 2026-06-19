"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useAddModal } from "@/lib/add-modal-context";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import type { Garment } from "@/types";
import {
  HelpCircle, Bell, User, Home, Shirt, Plus, Search,
  ChevronLeft, ChevronRight, Cloud, CloudSun, Sun,
} from "lucide-react";

// ── Weather ───────────────────────────────────────────────────────────────────

type Weather = { temp: number; high: number; low: number; code: number };

function useWeather() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) { setLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,weather_code` +
            `&daily=temperature_2m_max,temperature_2m_min` +
            `&timezone=auto&forecast_days=1`
          );
          const d = await res.json();
          setWeather({
            temp: Math.round(d.current.temperature_2m),
            high: Math.round(d.daily.temperature_2m_max[0]),
            low:  Math.round(d.daily.temperature_2m_min[0]),
            code: d.current.weather_code,
          });
        } catch { /* show placeholder */ }
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, []);

  return { weather, loading };
}

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  if (code === 0) return <Sun className={className} />;
  if (code <= 2)  return <CloudSun className={className} />;
  return <Cloud className={className} />;
}

// ── Outfit generation – 4 fixed category slots ────────────────────────────────

type SlotDef   = { key: string; label: string; cats: string[] };
type SlotFill  = SlotDef & { item: Garment | null };
type OutfitSet = SlotFill[];

const SLOT_DEFS: SlotDef[] = [
  { key: "top",       label: "Top",       cats: ["Top", "Kurta", "Dress", "Saree", "Lehenga", "Suit"] },
  { key: "bottom",    label: "Bottom",    cats: ["Bottom"] },
  { key: "shoes",     label: "Shoes",     cats: ["Shoes"] },
  { key: "accessory", label: "Accessory", cats: ["Accessory"] },
];

function pick<T>(arr: T[]): T | null {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
}

function buildOutfit(garments: Garment[]): OutfitSet {
  return SLOT_DEFS.map((def) => ({
    ...def,
    item: pick(garments.filter((g) => def.cats.includes(g.category))),
  }));
}

function generateOutfits(garments: Garment[], count = 5): OutfitSet[] {
  if (garments.length === 0) return [];
  return Array.from({ length: count }, () => buildOutfit(garments));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TodayPage() {
  const { user } = useAuth();
  const { openAdd } = useAddModal();
  const { weather, loading: weatherLoading } = useWeather();
  const { items: garments, loading: garmentsLoading } = useUserCollection<Garment>("garments");

  const [outfitIdx, setOutfitIdx] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const firstName = user?.displayName?.split(" ")[0] ?? "there";
  const today     = new Date();
  const dayNum    = today.getDate();
  const dayShort  = today.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const fullDate  = today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const outfits = useMemo(() => generateOutfits(garments), [garments]);

  useEffect(() => { setOutfitIdx(0); }, [outfits.length]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node))
        setShowNotifications(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const currentOutfit: OutfitSet = outfits[outfitIdx] ?? SLOT_DEFS.map((d) => ({ ...d, item: null }));
  const hasOutfits = outfits.length > 0;

  return (
    <div className="min-h-screen bg-white text-black">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">

          <Link href="/calendar"
            className="flex flex-col items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 gap-0.5 hover:bg-gray-100 transition-colors">
            <span className="text-[9px] font-bold text-gray-400 uppercase leading-none tracking-wider">{dayShort}</span>
            <span className="text-base font-bold text-black leading-none">{dayNum}</span>
          </Link>

          <Link href="/today" className="flex items-center">
            <img src="/local-lookbook-logo.png" alt="Local Lookbook" className="h-9 w-auto object-contain brightness-0" />
          </Link>

          <div className="flex items-center">
            <Link href="/profile" className="p-2 rounded-full hover:bg-gray-50 transition-colors" aria-label="Help">
              <HelpCircle className="h-5 w-5 text-gray-400" />
            </Link>

            <div className="relative" ref={bellRef}>
              <button onClick={() => setShowNotifications((v) => !v)}
                className="p-2 rounded-full hover:bg-gray-50 transition-colors" aria-label="Notifications">
                <Bell className="h-5 w-5 text-gray-400" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-10 w-64 bg-white border border-gray-100 rounded-2xl shadow-lg py-4 px-4 z-50">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Notifications</p>
                  <p className="text-sm text-gray-400 text-center py-4">No new notifications</p>
                </div>
              )}
            </div>

            <Link href="/profile" className="p-2 rounded-full hover:bg-gray-50 transition-colors" aria-label="Profile">
              <User className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 pt-6 pb-28 flex flex-col gap-6">

        {/* Greeting + Weather */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{fullDate}</p>
            <h2 className="text-2xl font-bold mt-1 leading-snug">
              {getGreeting()},<br />{firstName}
            </h2>
          </div>

          <div className="shrink-0 bg-gray-50 rounded-2xl px-4 py-3 text-right border border-gray-100 min-w-[90px]">
            {weatherLoading ? (
              <div className="flex flex-col items-end gap-1.5 animate-pulse">
                <div className="h-8 w-14 rounded bg-gray-200" />
                <div className="h-3 w-20 rounded bg-gray-200" />
              </div>
            ) : weather ? (
              <>
                <div className="flex items-end justify-end gap-1.5">
                  <WeatherIcon code={weather.code} className="h-4 w-4 text-gray-400 mb-1" />
                  <span className="text-3xl font-light leading-none">{weather.temp}°</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">H: {weather.high}° / L: {weather.low}°</p>
              </>
            ) : (
              <>
                <div className="flex items-end justify-end gap-1.5">
                  <Cloud className="h-4 w-4 text-gray-400 mb-1" />
                  <span className="text-3xl font-light leading-none">--°</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">Enable location</p>
              </>
            )}
          </div>
        </div>

        {/* Today's Suggestions Card */}
        <div className="rounded-3xl border border-gray-100 shadow-sm bg-white overflow-hidden">

          {/* Card header */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Today&apos;s Suggestions</p>
            {hasOutfits && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setOutfitIdx((i) => Math.max(0, i - 1))}
                  disabled={outfitIdx === 0}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center transition hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous outfit"
                >
                  <ChevronLeft className="h-4 w-4 text-black" />
                </button>
                <span className="text-xs text-gray-400 font-medium tabular-nums w-8 text-center">
                  {outfitIdx + 1}&nbsp;/&nbsp;{outfits.length}
                </span>
                <button
                  onClick={() => setOutfitIdx((i) => Math.min(outfits.length - 1, i + 1))}
                  disabled={outfitIdx === outfits.length - 1}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center transition hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next outfit"
                >
                  <ChevronRight className="h-4 w-4 text-black" />
                </button>
              </div>
            )}
          </div>

          {/* 4-slot outfit grid */}
          {garmentsLoading ? (
            <div className="grid grid-cols-2 gap-3 px-5 pb-5 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="h-3 w-16 rounded bg-gray-200" />
                  <div className="aspect-[3/4] rounded-2xl bg-gray-200" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-5 pb-5">
              {currentOutfit.map((slot) => (
                <div key={slot.key} className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest pl-0.5">
                    {slot.label}
                  </p>
                  {slot.item ? (
                    <div className="flex flex-col gap-1">
                      {slot.item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={slot.item.imageUrl}
                          alt={slot.item.name}
                          className="w-full aspect-[3/4] object-cover rounded-2xl shadow-sm"
                        />
                      ) : (
                        <div
                          className="w-full aspect-[3/4] rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: (slot.item.color ?? "#888888") + "22" }}
                        >
                          <Shirt className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <p className="text-[9px] text-gray-400 truncate text-center leading-tight px-0.5">
                        {slot.item.name}
                      </p>
                    </div>
                  ) : (
                    <div className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5">
                      <Shirt className="h-6 w-6 text-gray-300" />
                      <p className="text-[9px] text-gray-300 font-medium">No {slot.label.toLowerCase()}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty state (no garments at all) */}
          {!garmentsLoading && !hasOutfits && (
            <div className="pb-5 px-5 -mt-3 text-center">
              <p className="text-xs text-gray-400 font-medium">Add clothes to get outfit suggestions</p>
            </div>
          )}

          <p className="text-[11px] text-gray-400 leading-relaxed px-5 py-4 border-t border-gray-50">
            If you do not want to see a specific item, toggle{" "}
            <span className="font-semibold text-gray-600">&ldquo;Show in outfits&rdquo;</span> to OFF.
          </p>
        </div>
      </main>

      {/* ── Bottom Nav ──────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex items-center justify-around px-2 h-16">
          <Link href="/today" className="flex flex-col items-center gap-1 py-2 px-3 min-w-[3rem]">
            <Home className="h-5 w-5 text-black" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-black leading-none">Home</span>
          </Link>
          <Link href="/closet" className="flex flex-col items-center gap-1 py-2 px-3 min-w-[3rem]">
            <Shirt className="h-5 w-5 text-gray-300" />
            <span className="text-[10px] font-medium text-gray-300 leading-none">Clothing</span>
          </Link>
          <button onClick={openAdd} className="flex flex-col items-center -mt-5 px-3">
            <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center shadow-lg active:scale-95 transition-transform">
              <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
          </button>
          <Link href="/wardrobe" className="flex flex-col items-center gap-1 py-2 px-3 min-w-[3rem]">
            <Search className="h-5 w-5 text-gray-300" />
            <span className="text-[10px] font-medium text-gray-300 leading-none">Search</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 py-2 px-3 min-w-[3rem]">
            <User className="h-5 w-5 text-gray-300" />
            <span className="text-[10px] font-medium text-gray-300 leading-none">Profile</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}
