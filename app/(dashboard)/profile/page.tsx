"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ChevronRight, LogOut, Pencil, Settings, Share2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { upsertItem } from "@/lib/firestore";
import { cn } from "@/lib/utils";
import { Garment, StyleProfile, WishlistItem } from "@/types";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { items: garments } = useUserCollection<Garment>("garments");
  const { items: wishlist } = useUserCollection<WishlistItem>("wishlist");
  const { items: profiles } = useUserCollection<StyleProfile>("profiles");
  const profile = profiles[0];

  const [activeTab, setActiveTab] = useState<"closet" | "wishlist">("closet");
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    city: "",
    topSize: "",
    bottomSize: "",
    shoeSize: "",
    chest: "",
    waist: "",
    hip: "",
    shoulder: "",
  });

  useEffect(() => {
    setForm({
      displayName: profile?.displayName || user?.displayName || "",
      city: profile?.city || "",
      topSize: profile?.sizes?.top || "",
      bottomSize: profile?.sizes?.bottom || "",
      shoeSize: profile?.sizes?.shoe || "",
      chest: profile?.measurements?.chest || "",
      waist: profile?.measurements?.waist || "",
      hip: profile?.measurements?.hip || "",
      shoulder: profile?.measurements?.shoulder || "",
    });
  }, [profile, user?.displayName]);

  function setField(k: string, v: string) { setForm((c) => ({ ...c, [k]: v })); }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await upsertItem<Omit<StyleProfile, "id">>("profiles", profile?.id || user.uid, {
      userId: user.uid,
      displayName: form.displayName,
      city: form.city,
      styleWords: profile?.styleWords || [],
      favoriteColors: profile?.favoriteColors || [],
      sizes: { top: form.topSize, bottom: form.bottomSize, shoe: form.shoeSize },
      measurements: { chest: form.chest, waist: form.waist, hip: form.hip, shoulder: form.shoulder },
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
    setEditOpen(false);
  }

  const stats = useMemo(() => ({
    items:   garments.length,
    saved:   wishlist.filter((w) => !w.purchased).length,
    worn:    garments.filter((g) => g.wearCount > 0).length,
  }), [garments, wishlist]);

  const displayName = profile?.displayName || user?.displayName || "Your name";
  const initial     = displayName[0].toUpperCase();
  const photoUrl    = user?.photoURL;

  // Member since from Firebase createdAt (milliseconds string)
  const memberSince = useMemo(() => {
    const ts = (user as { metadata?: { creationTime?: string } } | null)?.metadata?.creationTime;
    if (!ts) return null;
    return new Date(ts).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }, [user]);

  // Profile completeness
  const isComplete = !!(profile?.displayName && profile?.sizes?.top);

  // Recent items for tab previews
  const recentGarments = useMemo(() => [...garments].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 8), [garments]);

  const activeWishlist = useMemo(() => wishlist.filter((w) => !w.purchased).slice(0, 8), [wishlist]);

  return (
    <div className="space-y-0 -mx-4 md:mx-0">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-2 pb-4">
        <h1 className="text-2xl font-bold text-[#111111]">Profile</h1>
        <button
          onClick={() => setEditOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#F5F5F5]"
        >
          <Settings className="h-5 w-5 text-[#888888]" />
        </button>
      </div>

      {/* ── Avatar + name + stats ───────────────────────────────────── */}
      <div className="px-4 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-20 w-20 rounded-full object-cover bg-[#111111]" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#111111] text-white text-2xl font-bold select-none">
                {initial}
              </div>
            )}
          </div>

          {/* Name + stats */}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-[#111111] truncate">{displayName}</p>

            {/* Stats row */}
            <div className="mt-2 flex items-center gap-5">
              <Stat value={stats.worn} label="worn" />
              <Stat value={stats.saved} label="saved" accent />
              <Stat value={stats.items} label="items" accent />
            </div>
          </div>
        </div>

        {/* Member since */}
        {memberSince && (
          <p className="mt-3 text-sm text-[#AAAAAA]">Member since {memberSince}</p>
        )}
      </div>

      {/* ── Action buttons ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <button
          onClick={() => setEditOpen(true)}
          className="flex flex-1 items-center justify-center rounded-xl border border-[#E0E0E0] bg-white py-2.5 text-sm font-semibold text-[#111111] transition hover:bg-[#F8F8F8] active:scale-[0.98]"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit profile
        </button>
        <button
          className="flex flex-1 items-center justify-center rounded-xl border border-[#E0E0E0] bg-white py-2.5 text-sm font-semibold text-[#111111] transition hover:bg-[#F8F8F8] active:scale-[0.98]"
          onClick={() => navigator.share?.({ title: "vastra", url: window.location.href })}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share profile
        </button>
        <button
          onClick={logout}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E0E0E0] bg-white text-[#888888] transition hover:bg-[#F8F8F8] active:scale-95"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* ── Completion card ─────────────────────────────────────────── */}
      {!isComplete && (
        <div className="mx-4 mb-4">
          <button
            onClick={() => setEditOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl border border-[#E8E8E8] bg-white px-4 py-3.5 text-left transition hover:bg-[#FAFAFA]"
          >
            <div>
              <p className="text-sm font-semibold text-[#111111]">Your profile is almost complete</p>
              <p className="mt-0.5 text-xs text-[#AAAAAA]">
                Add your name and sizes to get the most out of Vastra
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-[#CCCCCC]" />
          </button>
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="sticky top-14 z-20 flex border-b border-[#E8E8E8] bg-[#FAFAFA] px-4">
        {(["closet", "wishlist"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3.5 text-sm font-semibold capitalize transition-colors",
              activeTab === tab
                ? "border-b-2 border-[#111111] text-[#111111]"
                : "text-[#AAAAAA] hover:text-[#888888]"
            )}
          >
            {tab === "closet" ? "Closet" : "Wishlist"}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────────────── */}
      <div className="px-4 pt-4">
        {activeTab === "closet" && (
          recentGarments.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {recentGarments.map((g) => (
                <div key={g.id} className="group aspect-square overflow-hidden rounded-2xl bg-[#F0F0F0]">
                  {g.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.imageUrl} alt={g.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-5 w-5 rounded-full border-2 border-[#CCCCCC]" style={{ background: g.color }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyTab text="Your closet is empty" sub="Add your first garment to get started" />
          )
        )}

        {activeTab === "wishlist" && (
          activeWishlist.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {activeWishlist.map((w) => (
                <div key={w.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-[#F0F0F0]">
                  {w.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.imageUrl} alt={w.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#CCCCCC]">
                      <span className="text-xs font-medium">{w.name[0]}</span>
                    </div>
                  )}
                  <span className={cn(
                    "absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                    w.priority === "high"   ? "bg-red-100 text-red-600" :
                    w.priority === "medium" ? "bg-amber-100 text-amber-600" :
                    "bg-[#F0F0F0] text-[#888888]"
                  )}>
                    {w.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyTab text="Wishlist is empty" sub="Save items you want to buy" />
          )
        )}
      </div>

      {/* ── Edit modal ──────────────────────────────────────────────── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile">
        <form onSubmit={saveProfile} className="space-y-4">
          <Input placeholder="Display name" value={form.displayName} onChange={(e) => setField("displayName", e.target.value)} />
          <Input placeholder="City" value={form.city} onChange={(e) => setField("city", e.target.value)} />

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#888888]">Sizes</p>
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Top" value={form.topSize} onChange={(e) => setField("topSize", e.target.value)} />
              <Input placeholder="Bottom" value={form.bottomSize} onChange={(e) => setField("bottomSize", e.target.value)} />
              <Input placeholder="Shoe" value={form.shoeSize} onChange={(e) => setField("shoeSize", e.target.value)} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#888888]">Measurements (cm)</p>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Chest" value={form.chest} onChange={(e) => setField("chest", e.target.value)} />
              <Input placeholder="Waist" value={form.waist} onChange={(e) => setField("waist", e.target.value)} />
              <Input placeholder="Hip" value={form.hip} onChange={(e) => setField("hip", e.target.value)} />
              <Input placeholder="Shoulder" value={form.shoulder} onChange={(e) => setField("shoulder", e.target.value)} />
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={saving}>Save</Button>
        </form>
      </Modal>
    </div>
  );
}

function Stat({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-start">
      <span className={cn("text-lg font-bold leading-tight", accent ? "text-[#111111]" : "text-[#111111]")}>
        {value}
      </span>
      <span className={cn("text-xs", accent ? "text-[#888888]" : "text-[#AAAAAA]")}>{label}</span>
    </div>
  );
}

function EmptyTab({ text, sub }: { text: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="font-semibold text-[#888888]">{text}</p>
      <p className="mt-1 text-sm text-[#AAAAAA]">{sub}</p>
    </div>
  );
}
