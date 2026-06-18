"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertCircle, BarChart3, Heart, Package, TrendingDown, TrendingUp } from "lucide-react";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { cn } from "@/lib/utils";
import { Garment } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysSince(dateStr?: string): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function cpw(g: Garment): number | null {
  if (!g.price || !g.wearCount) return null;
  return g.price / g.wearCount;
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function MiniBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 shrink-0 truncate text-right text-[#888888]">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#F0F0F0]">
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-6 shrink-0 text-[#AAAAAA]">{count}</span>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-4", accent ? "border-[#111111] bg-[#111111] text-white" : "border-[#F0F0F0] bg-white")}>
      <p className={cn("text-xs font-semibold uppercase tracking-wider", accent ? "text-white/60" : "text-[#AAAAAA]")}>{label}</p>
      <p className={cn("mt-1 text-2xl font-bold", accent ? "text-white" : "text-[#111111]")}>{value}</p>
      {sub && <p className={cn("mt-0.5 text-xs", accent ? "text-white/50" : "text-[#CCCCCC]")}>{sub}</p>}
    </div>
  );
}

// ─── Garment row ─────────────────────────────────────────────────────────────

function GarmentRow({ g, badge, badgeColor }: { g: Garment; badge: string; badgeColor: string }) {
  return (
    <Link href={`/closet/${g.id}`}
      className="flex items-center gap-3 rounded-2xl border border-[#F0F0F0] bg-white px-4 py-3 transition hover:border-[#DDDDDD] hover:shadow-sm">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#F5F5F5]">
        {g.imageUrl
          ? <img src={g.imageUrl} alt={g.name} className="h-full w-full object-cover" />  // eslint-disable-line @next/next/no-img-element
          : <div className="flex h-full items-center justify-center"><div className="h-4 w-4 rounded-full" style={{ background: g.color }} /></div>
        }
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#111111]">{g.name}</p>
        <p className="text-xs text-[#AAAAAA]">{g.category}{g.brand ? ` · ${g.brand}` : ""}</p>
      </div>
      <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", badgeColor)}>{badge}</span>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { items: garments } = useUserCollection<Garment>("garments");

  const stats = useMemo(() => {
    if (!garments.length) return null;

    const totalValue   = garments.reduce((s, g) => s + (g.price ?? 0), 0);
    const totalWears   = garments.reduce((s, g) => s + (g.wearCount ?? 0), 0);
    const wornItems    = garments.filter((g) => (g.wearCount ?? 0) > 0);
    const neverWorn    = garments.filter((g) => !g.wearCount);
    const favourites   = garments.filter((g) => g.tags?.includes("favorite"));

    // Cost per wear rankings
    const withCpw      = garments.filter((g) => cpw(g) !== null).sort((a, b) => cpw(a)! - cpw(b)!);
    const bestCpw      = withCpw.slice(0, 5);
    const worstCpw     = [...withCpw].reverse().slice(0, 5);

    // Most / least worn
    const sorted       = [...wornItems].sort((a, b) => (b.wearCount ?? 0) - (a.wearCount ?? 0));
    const mostWorn     = sorted.slice(0, 5);
    const leastWorn    = sorted.length > 5 ? sorted.slice(-5).reverse() : [];

    // Stale items (not worn in 90+ days)
    const stale        = garments
      .filter((g) => (g.wearCount ?? 0) > 0)
      .filter((g) => { const d = daysSince(g.lastWorn); return d !== null && d >= 90; })
      .sort((a, b) => (daysSince(b.lastWorn) ?? 0) - (daysSince(a.lastWorn) ?? 0))
      .slice(0, 5);

    // Potential donates
    const donates      = garments.filter((g) => g.tags?.includes("donate-maybe")).slice(0, 5);

    // Category distribution
    const catCounts: Record<string, number> = {};
    for (const g of garments) { catCounts[g.category] = (catCounts[g.category] ?? 0) + 1; }
    const catEntries = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    const maxCat     = catEntries[0]?.[1] ?? 1;

    // Color distribution
    const colorCounts: Record<string, { count: number; color: string }> = {};
    for (const g of garments) {
      const key = g.colorName || g.color;
      colorCounts[key] = { count: (colorCounts[key]?.count ?? 0) + 1, color: g.color };
    }
    const colorEntries = Object.entries(colorCounts).sort((a, b) => b[1].count - a[1].count).slice(0, 8);
    const maxColor     = colorEntries[0]?.[1]?.count ?? 1;

    return {
      totalValue, totalWears, wornItems, neverWorn, favourites,
      bestCpw, worstCpw, mostWorn, leastWorn, stale, donates,
      catEntries, maxCat, colorEntries, maxColor,
      avgCpw: wornItems.filter((g) => g.price).length
        ? wornItems.filter((g) => g.price).reduce((s, g) => s + cpw(g)!, 0) / wornItems.filter((g) => g.price).length
        : null,
    };
  }, [garments]);

  if (!garments.length) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <BarChart3 className="h-12 w-12 text-[#DDDDDD]" />
        <p className="font-semibold text-[#111111]">No data yet</p>
        <p className="text-sm text-[#AAAAAA]">Add some items to your closet to see analytics</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-7">
      <h1 className="text-2xl font-bold text-[#111111]">Analytics</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total items" value={garments.length} accent />
        <StatCard label="Closet value" value={`₹${stats.totalValue.toLocaleString("en-IN")}`} />
        <StatCard label="Total wears" value={stats.totalWears} />
        <StatCard
          label="Never worn"
          value={stats.neverWorn.length}
          sub={`${Math.round((stats.neverWorn.length / garments.length) * 100)}% of closet`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Favourites" value={stats.favourites.length} />
        <StatCard label="Worn items" value={stats.wornItems.length} />
        {stats.avgCpw !== null && (
          <StatCard label="Avg cost/wear" value={`₹${stats.avgCpw.toFixed(0)}`} sub="across worn items with price" />
        )}
        <StatCard label="Donate flagged" value={stats.donates.length} />
      </div>

      {/* Category distribution */}
      <div className="rounded-2xl border border-[#F0F0F0] bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#888888]" />
          <p className="text-sm font-bold text-[#111111]">By category</p>
        </div>
        <div className="space-y-2">
          {stats.catEntries.map(([cat, count]) => (
            <MiniBar key={cat} label={cat} count={count} max={stats.maxCat} color="#111111" />
          ))}
        </div>
      </div>

      {/* Color distribution */}
      {stats.colorEntries.length > 0 && (
        <div className="rounded-2xl border border-[#F0F0F0] bg-white p-4">
          <p className="mb-3 text-sm font-bold text-[#111111]">By colour</p>
          <div className="flex flex-wrap gap-2">
            {stats.colorEntries.map(([name, { count, color }]) => (
              <div key={name} className="flex items-center gap-1.5 rounded-full border border-[#EEEEEE] px-2.5 py-1.5 text-xs">
                <span className="h-3 w-3 rounded-full" style={{ background: color }} />
                <span className="capitalize text-[#888888]">{name}</span>
                <span className="font-semibold text-[#111111]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best cost-per-wear */}
      {stats.bestCpw.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-green-500" />
            <p className="text-sm font-bold text-[#111111]">Best cost-per-wear</p>
            <span className="text-xs text-[#AAAAAA]">(cheapest per use)</span>
          </div>
          <div className="space-y-2">
            {stats.bestCpw.map((g) => (
              <GarmentRow key={g.id} g={g}
                badge={`₹${cpw(g)!.toFixed(0)}/wear`}
                badgeColor="bg-green-50 text-green-700" />
            ))}
          </div>
        </div>
      )}

      {/* Worst cost-per-wear */}
      {stats.worstCpw.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-400" />
            <p className="text-sm font-bold text-[#111111]">Highest cost-per-wear</p>
            <span className="text-xs text-[#AAAAAA]">(needs more use)</span>
          </div>
          <div className="space-y-2">
            {stats.worstCpw.map((g) => (
              <GarmentRow key={g.id} g={g}
                badge={`₹${cpw(g)!.toFixed(0)}/wear`}
                badgeColor="bg-orange-50 text-orange-700" />
            ))}
          </div>
        </div>
      )}

      {/* Most worn */}
      {stats.mostWorn.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-400" />
            <p className="text-sm font-bold text-[#111111]">Most worn</p>
          </div>
          <div className="space-y-2">
            {stats.mostWorn.map((g) => (
              <GarmentRow key={g.id} g={g}
                badge={`${g.wearCount} wears`}
                badgeColor="bg-rose-50 text-rose-700" />
            ))}
          </div>
        </div>
      )}

      {/* Least worn (from worn items) */}
      {stats.leastWorn.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-[#AAAAAA]" />
            <p className="text-sm font-bold text-[#111111]">Least worn</p>
          </div>
          <div className="space-y-2">
            {stats.leastWorn.map((g) => (
              <GarmentRow key={g.id} g={g}
                badge={`${g.wearCount} wear${g.wearCount === 1 ? "" : "s"}`}
                badgeColor="bg-[#F5F5F5] text-[#888888]" />
            ))}
          </div>
        </div>
      )}

      {/* Never worn */}
      {stats.neverWorn.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <p className="text-sm font-bold text-[#111111]">Never worn</p>
            <span className="text-xs text-[#AAAAAA]">({stats.neverWorn.length} items)</span>
          </div>
          <div className="space-y-2">
            {stats.neverWorn.slice(0, 5).map((g) => (
              <GarmentRow key={g.id} g={g}
                badge="0 wears"
                badgeColor="bg-amber-50 text-amber-700" />
            ))}
            {stats.neverWorn.length > 5 && (
              <p className="text-center text-xs text-[#AAAAAA]">+{stats.neverWorn.length - 5} more</p>
            )}
          </div>
        </div>
      )}

      {/* Stale items */}
      {stats.stale.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-slate-400" />
            <p className="text-sm font-bold text-[#111111]">Not worn in 90+ days</p>
          </div>
          <div className="space-y-2">
            {stats.stale.map((g) => {
              const d = daysSince(g.lastWorn);
              return (
                <GarmentRow key={g.id} g={g}
                  badge={d ? `${d}d ago` : "stale"}
                  badgeColor="bg-slate-50 text-slate-600" />
              );
            })}
          </div>
        </div>
      )}

      {/* Donate flagged */}
      {stats.donates.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-sm font-bold text-[#111111]">Tagged for donation</p>
          <div className="space-y-2">
            {stats.donates.map((g) => (
              <GarmentRow key={g.id} g={g}
                badge="Donate?"
                badgeColor="bg-purple-50 text-purple-700" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
