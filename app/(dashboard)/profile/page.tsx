"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { FormEvent, useEffect, useMemo, useState } from "react";
import { LogOut, Save } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertItem } from "@/lib/firestore";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { formatCurrency } from "@/lib/utils";
import { Garment, StyleProfile } from "@/types";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { items: garments } = useUserCollection<Garment>("garments");
  const { items: profiles } = useUserCollection<StyleProfile>("profiles");
  const profile = profiles[0];
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: profile?.displayName || user?.displayName || "",
    city: profile?.city || "",
    styleWords: profile?.styleWords?.join(", ") || "",
    favoriteColors: profile?.favoriteColors?.join(", ") || "",
    topSize: profile?.sizes?.top || "",
    bottomSize: profile?.sizes?.bottom || "",
    shoeSize: profile?.sizes?.shoe || "",
    chest: profile?.measurements?.chest || "",
    waist: profile?.measurements?.waist || "",
    hip: profile?.measurements?.hip || "",
    shoulder: profile?.measurements?.shoulder || "",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      displayName: profile.displayName || user?.displayName || "",
      city: profile.city || "",
      styleWords: profile.styleWords?.join(", ") || "",
      favoriteColors: profile.favoriteColors?.join(", ") || "",
      topSize: profile.sizes?.top || "",
      bottomSize: profile.sizes?.bottom || "",
      shoeSize: profile.sizes?.shoe || "",
      chest: profile.measurements?.chest || "",
      waist: profile.measurements?.waist || "",
      hip: profile.measurements?.hip || "",
      shoulder: profile.measurements?.shoulder || "",
    });
  }, [profile, user?.displayName]);

  const stats = useMemo(() => {
    const value = garments.reduce((sum, g) => sum + (g.price || 0), 0);
    const worn = garments.filter((g) => g.wearCount > 0).length;
    return { value, worn };
  }, [garments]);

  function setField(name: string, value: string) {
    setForm((c) => ({ ...c, [name]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await upsertItem<Omit<StyleProfile, "id">>("profiles", profile?.id || user.uid, {
      userId: user.uid,
      displayName: form.displayName,
      city: form.city,
      styleWords: form.styleWords.split(",").map((s) => s.trim()).filter(Boolean),
      favoriteColors: form.favoriteColors.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: { top: form.topSize, bottom: form.bottomSize, shoe: form.shoeSize },
      measurements: { chest: form.chest, waist: form.waist, hip: form.hip, shoulder: form.shoulder },
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
  }

  const initial = (user?.displayName || user?.email || "?")[0].toUpperCase();

  return (
    <div className="space-y-8">
      {/* Avatar + user info */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#111111] text-white text-xl font-bold">
          {initial}
        </div>
        <div>
          <p className="font-semibold text-[#111111]">{user?.displayName || "Your name"}</p>
          <p className="text-sm text-[#888888]">{user?.email}</p>
        </div>
        <div className="ml-auto">
          <Button variant="ghost" size="sm" onClick={logout} className="gap-1.5 text-[#888888]">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Items", value: garments.length },
          { label: "Worn", value: stats.worn },
          { label: "Value", value: formatCurrency(stats.value) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#E8E8E8] bg-white p-4 text-center">
            <p className="text-xl font-bold text-[#111111]">{stat.value}</p>
            <p className="mt-0.5 text-xs text-[#888888]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Profile form */}
      <form onSubmit={submit} className="space-y-6">
        <div className="rounded-2xl border border-[#E8E8E8] bg-white p-5 space-y-4">
          <p className="text-sm font-semibold text-[#111111]">Personal info</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Display name" value={form.displayName} onChange={(e) => setField("displayName", e.target.value)} />
            <Input placeholder="City" value={form.city} onChange={(e) => setField("city", e.target.value)} />
            <Input placeholder="Style words (comma separated)" value={form.styleWords} onChange={(e) => setField("styleWords", e.target.value)} />
            <Input placeholder="Favorite colors (comma separated)" value={form.favoriteColors} onChange={(e) => setField("favoriteColors", e.target.value)} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8E8E8] bg-white p-5 space-y-4">
          <p className="text-sm font-semibold text-[#111111]">Sizes</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input placeholder="Top size" value={form.topSize} onChange={(e) => setField("topSize", e.target.value)} />
            <Input placeholder="Bottom size" value={form.bottomSize} onChange={(e) => setField("bottomSize", e.target.value)} />
            <Input placeholder="Shoe size" value={form.shoeSize} onChange={(e) => setField("shoeSize", e.target.value)} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8E8E8] bg-white p-5 space-y-4">
          <p className="text-sm font-semibold text-[#111111]">Measurements</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <Input placeholder="Chest" value={form.chest} onChange={(e) => setField("chest", e.target.value)} />
            <Input placeholder="Waist" value={form.waist} onChange={(e) => setField("waist", e.target.value)} />
            <Input placeholder="Hip" value={form.hip} onChange={(e) => setField("hip", e.target.value)} />
            <Input placeholder="Shoulder" value={form.shoulder} onChange={(e) => setField("shoulder", e.target.value)} />
          </div>
        </div>

        <Button type="submit" isLoading={saving} className="gap-2">
          <Save className="h-4 w-4" />
          Save profile
        </Button>
      </form>
    </div>
  );
}
