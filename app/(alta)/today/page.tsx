"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useAddModal } from "@/lib/add-modal-context";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { Garment, Outfit } from "@/types";
import {
  HelpCircle,
  Bell,
  User,
  Home,
  Shirt,
  Plus,
  Heart,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudSun,
  Sun,
} from "lucide-react";

// ── Weather ──────────────────────────────────────────────────────────────────

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
        } catch { /* silently keep loading=true so we show placeholder */ }
        setLoading(false);
      },
      () => setLoading(false)   // permission denied
    );
  }, []);

  return { weather, loading };
}

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  if (code === 0) return <Sun className={className} />;
  if (code <= 2)  return <CloudSun className={className} />;
  return <Cloud className={className} />;
}

// ── Outfit data ───────────────────────────────────────────────────────────────

type Suggestion = {
  id: string;
  title: string;
  subtitle: string;
  label: string;
  garments: Garment[];
};

function buildSuggestions(outfits: Outfit[], garments: Garment[]): Suggestion[] {
  const garmentMap = new Map(garments.map((item) => [item.id, item]));
  const saved = outfits.slice(0, 5).map((outfit) => ({
    id: `outfit-${outfit.id}`,
    title: outfit.name,
    subtitle: outfit.occasion || outfit.season || "Saved outfit",
    label: outfit.weatherTags?.length ? outfit.weatherTags.join(" / ") : "Ready from your outfits",
    garments: outfit.garmentIds.map((id) => garmentMap.get(id)).filter(Boolean) as Garment[],
  }));

  if (saved.length) return saved;

  const top = garments.find((item) => ["Top", "Kurta", "Suit", "Outerwear"].includes(item.category));
  const bottom = garments.find((item) => item.category === "Bottom");
  const dress = garments.find((item) => ["Dress", "Saree", "Lehenga"].includes(item.category));
  const shoes = garments.find((item) => item.category === "Shoes");
  const accessory = garments.find((item) => item.category === "Accessory");
  const pieces = [dress || top, !dress ? bottom : undefined, shoes, accessory].filter(Boolean) as Garment[];

  if (pieces.length < 2) return [];

  return [{
    id: "generated-1",
    title: "Today’s Best Match",
    subtitle: pieces.map((item) => item.category).slice(0, 3).join(" + "),
    label: "Built from your closet",
    garments: pieces,
  }];
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
  const { items: savedOutfits, loading: outfitsLoading } = useUserCollection<Outfit>("outfits");
  const [outfitIdx, setOutfitIdx] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const firstName = user?.displayName?.split(" ")[0] ?? "there";
  const today     = new Date();
  const dayNum    = today.getDate();
  const dayShort  = today.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const fullDate  = today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const suggestions = buildSuggestions(savedOutfits, garments);
  const activeSuggestion = suggestions[outfitIdx];
  const suggestionsLoading = garmentsLoading || outfitsLoading;

  // Close notification panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (outfitIdx > 0 && outfitIdx >= suggestions.length) {
      setOutfitIdx(Math.max(0, suggestions.length - 1));
    }
  }, [outfitIdx, suggestions.length]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#070707]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">

          {/* Date → calendar */}
          <Link
            href="/calendar"
            className="flex h-10 w-10 flex-col items-center justify-center gap-0.5 rounded-xl border border-white/10 bg-white/[0.05] transition-colors hover:bg-white/[0.08]"
          >
            <span className="text-[9px] font-bold uppercase leading-none tracking-wider text-white/40">
              {dayShort}
            </span>
            <span className="text-base font-bold leading-none text-white">{dayNum}</span>
          </Link>

          {/* Logo → home */}
          <Link href="/today" className="flex items-center">
            <img
              src="/mastical-white-logo.svg"
              alt="Mastical"
              className="h-8 w-auto object-contain"
            />
          </Link>

          {/* Utility icons */}
          <div className="flex items-center relative">
            {/* Help → profile */}
            <Link
              href="/profile"
              className="rounded-full p-2 transition-colors hover:bg-white/[0.07]"
              aria-label="Help & settings"
            >
              <HelpCircle className="h-5 w-5 text-white/45" />
            </Link>

            {/* Bell → notifications dropdown */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className="relative rounded-full p-2 transition-colors hover:bg-white/[0.07]"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-white/45" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-10 z-50 w-64 rounded-2xl border border-white/10 bg-[#101010] px-4 py-4 shadow-2xl">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/45">
                    Notifications
                  </p>
                  <p className="py-4 text-center text-sm text-white/45">
                    No new notifications
                  </p>
                </div>
              )}
            </div>

            {/* User → profile */}
            <Link
              href="/profile"
              className="rounded-full p-2 transition-colors hover:bg-white/[0.07]"
              aria-label="Profile"
            >
              <User className="h-5 w-5 text-white/45" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="mx-auto flex max-w-5xl flex-col gap-5 px-4 pb-28 pt-6 sm:gap-6">

        {/* Greeting + Weather */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/42">
              {fullDate}
            </p>
            <h2 className="mt-1 text-2xl font-semibold leading-snug text-white sm:text-3xl">
              {getGreeting()},<br />{firstName}
            </h2>
          </div>

          {/* Weather pill */}
          <div className="min-w-[90px] shrink-0 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-right">
            {weatherLoading ? (
              <div className="flex flex-col items-end gap-1.5 animate-pulse">
                <div className="h-8 w-14 rounded bg-white/10" />
                <div className="h-3 w-20 rounded bg-white/10" />
              </div>
            ) : weather ? (
              <>
                <div className="flex items-end justify-end gap-1.5">
                  <WeatherIcon code={weather.code} className="mb-1 h-4 w-4 text-cyan-100/70" />
                  <span className="text-3xl font-light leading-none">{weather.temp}°</span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-white/45">
                  H: {weather.high}° / L: {weather.low}°
                </p>
              </>
            ) : (
              <>
                <div className="flex items-end justify-end gap-1.5">
                  <Cloud className="mb-1 h-4 w-4 text-white/45" />
                  <span className="text-3xl font-light leading-none">--°</span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-white/45">Enable location</p>
              </>
            )}
          </div>
        </div>

        {/* Today's Suggestions Card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          <div className="flex items-start justify-between px-5 pb-3 pt-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/42">
                Today&apos;s Suggestions
              </p>
              <h3 className="mt-1 text-xl font-semibold text-white">
                {activeSuggestion?.title ?? (suggestionsLoading ? "Reading your closet" : "No suggestion yet")}
              </h3>
              <p className="mt-0.5 text-sm text-white/52">
                {activeSuggestion?.subtitle ?? (suggestionsLoading ? "Building today&apos;s match" : "Add at least two closet pieces")}
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium tabular-nums text-white/52">
              {suggestions.length ? outfitIdx + 1 : 0}&nbsp;/&nbsp;{suggestions.length || 0}
            </span>
          </div>

          <div className="relative mx-4 mb-1 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
            <button
              onClick={() => setOutfitIdx((i) => Math.max(0, i - 1))}
              disabled={outfitIdx === 0 || suggestions.length <= 1}
              className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] shadow-md transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Previous outfit"
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </button>

            <div className="flex min-h-[18rem] flex-col items-center justify-center gap-3 px-8 py-12 sm:min-h-[22rem]">
              {suggestionsLoading ? (
                <>
                  <div className="h-28 w-24 animate-pulse rounded-2xl bg-white/[0.08]" />
                  <div className="flex gap-3">
                    <div className="h-14 w-14 animate-pulse rounded-xl bg-white/[0.10]" />
                    <div className="h-14 w-14 animate-pulse rounded-xl bg-white/[0.07]" />
                  </div>
                  <p className="mt-1 text-xs font-medium text-white/45">Checking your closet</p>
                </>
              ) : activeSuggestion ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {activeSuggestion.garments.slice(0, 4).map((garment, index) => (
                      <GarmentTile key={`${activeSuggestion.id}-${garment.id}`} garment={garment} featured={index === 0} />
                    ))}
                  </div>
                  <p className="mt-1 text-xs font-medium text-white/45">{activeSuggestion.label}</p>
                </>
              ) : (
                <>
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/[0.08]">
                    <Shirt className="h-10 w-10 text-white/35" />
                  </div>
                  <p className="max-w-xs text-center text-sm text-white/58">
                    Add a top and bottom, or save an outfit, and Mastical will suggest looks here.
                  </p>
                  <button
                    onClick={openAdd}
                    className="mt-2 rounded-full bg-[#F7FBFF] px-4 py-2 text-sm font-medium text-[#070707]"
                  >
                    Add closet piece
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setOutfitIdx((i) => Math.min(suggestions.length - 1, i + 1))}
              disabled={outfitIdx >= suggestions.length - 1 || suggestions.length <= 1}
              className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] shadow-md transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Next outfit"
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          </div>

          <p className="px-5 py-4 text-[11px] leading-relaxed text-white/42">
            If you do not want to see a specific item, you can toggle{" "}
            <span className="font-semibold text-white/64">&ldquo;Show in outfits&rdquo;</span> to OFF.
          </p>
        </div>
      </main>

      {/* ── Bottom Nav ──────────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#070707]/92 pb-safe backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-around px-2">
          <Link href="/today" className="flex flex-col items-center gap-1 py-2 px-3 min-w-[3rem]">
            <Home className="h-5 w-5 text-cyan-100" strokeWidth={2.5} />
            <span className="text-[10px] font-bold leading-none text-white">Home</span>
          </Link>

          <Link href="/closet" className="flex flex-col items-center gap-1 py-2 px-3 min-w-[3rem]">
            <Shirt className="h-5 w-5 text-white/35" />
            <span className="text-[10px] font-medium leading-none text-white/35">Clothing</span>
          </Link>

          <button onClick={openAdd} className="flex -translate-y-4 flex-col items-center px-3" aria-label="Add item">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-[#F7FBFF] text-[#070707] shadow-[0_12px_28px_rgba(0,0,0,0.35)] transition-transform active:scale-95">
              <Plus className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </button>

          <Link href="/wishlist" className="flex flex-col items-center gap-1 py-2 px-3 min-w-[3rem]">
            <Heart className="h-5 w-5 text-white/35" />
            <span className="text-[10px] font-medium leading-none text-white/35">Wishlist</span>
          </Link>

          <Link href="/profile" className="flex flex-col items-center gap-1 py-2 px-3 min-w-[3rem]">
            <User className="h-5 w-5 text-white/35" />
            <span className="text-[10px] font-medium leading-none text-white/35">Profile</span>
          </Link>
        </div>
      </nav>

    </div>
  );
}

function GarmentTile({ garment, featured = false }: { garment: Garment; featured?: boolean }) {
  return (
    <div className={featured ? "col-span-2 flex flex-col items-center" : ""}>
      <div
        className={
          featured
            ? "relative h-28 w-24 overflow-hidden rounded-2xl bg-white/[0.08]"
            : "relative h-16 w-16 overflow-hidden rounded-xl bg-white/[0.08]"
        }
      >
        {garment.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={garment.imageUrl} alt={garment.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Shirt className={featured ? "h-10 w-10 text-white/35" : "h-6 w-6 text-white/35"} />
          </div>
        )}
      </div>
      {featured && (
        <p className="mt-2 max-w-[11rem] truncate text-center text-xs font-medium text-white/58">
          {garment.name}
        </p>
      )}
    </div>
  );
}
