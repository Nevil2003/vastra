"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
    preferredTailor: profile?.preferredTailor || "",
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
      preferredTailor: profile.preferredTailor || "",
    });
  }, [profile, user?.displayName]);

  const stats = useMemo(() => {
    const value = garments.reduce((sum, item) => sum + (item.price || 0), 0);
    const stitched = garments.filter((item) => item.stitchingStatus !== "not-needed").length;
    const worn = garments.filter((item) => item.wearCount > 0).length;
    return { value, stitched, worn };
  }, [garments]);

  function setField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await upsertItem<Omit<StyleProfile, "id">>("profiles", profile?.id || user.uid, {
      userId: user.uid,
      displayName: form.displayName,
      city: form.city,
      styleWords: form.styleWords.split(",").map((item) => item.trim()).filter(Boolean),
      favoriteColors: form.favoriteColors.split(",").map((item) => item.trim()).filter(Boolean),
      sizes: { top: form.topSize, bottom: form.bottomSize, shoe: form.shoeSize },
      measurements: { chest: form.chest, waist: form.waist, hip: form.hip, shoulder: form.shoulder },
      preferredTailor: form.preferredTailor,
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#3C3489]">Style Profile</p>
          <h1 className="font-serif text-4xl font-semibold text-[#17152D]">Fit and preference memory</h1>
          <p className="mt-2 text-[#5F596B]">Sizes, measurements, colors, city, and tailor notes.</p>
        </div>
        <Button variant="outline" onClick={logout}>Sign out</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>Profile details</CardTitle>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Display name" value={form.displayName} onChange={(e) => setField("displayName", e.target.value)} />
                <Input placeholder="City" value={form.city} onChange={(e) => setField("city", e.target.value)} />
                <Input placeholder="Style words, comma separated" value={form.styleWords} onChange={(e) => setField("styleWords", e.target.value)} />
                <Input placeholder="Favorite colors, comma separated" value={form.favoriteColors} onChange={(e) => setField("favoriteColors", e.target.value)} />
              </div>
              <div className="rounded-2xl border border-[#E5DACB] bg-[#F8F3EA] p-4">
                <p className="mb-3 text-sm font-semibold text-[#17152D]">Sizes</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input placeholder="Top size" value={form.topSize} onChange={(e) => setField("topSize", e.target.value)} />
                  <Input placeholder="Bottom size" value={form.bottomSize} onChange={(e) => setField("bottomSize", e.target.value)} />
                  <Input placeholder="Shoe size" value={form.shoeSize} onChange={(e) => setField("shoeSize", e.target.value)} />
                </div>
              </div>
              <div className="rounded-2xl border border-[#E5DACB] bg-[#F8F3EA] p-4">
                <p className="mb-3 text-sm font-semibold text-[#17152D]">Measurements</p>
                <div className="grid gap-3 sm:grid-cols-4">
                  <Input placeholder="Chest" value={form.chest} onChange={(e) => setField("chest", e.target.value)} />
                  <Input placeholder="Waist" value={form.waist} onChange={(e) => setField("waist", e.target.value)} />
                  <Input placeholder="Hip" value={form.hip} onChange={(e) => setField("hip", e.target.value)} />
                  <Input placeholder="Shoulder" value={form.shoulder} onChange={(e) => setField("shoulder", e.target.value)} />
                </div>
              </div>
              <Input placeholder="Preferred tailor" value={form.preferredTailor} onChange={(e) => setField("preferredTailor", e.target.value)} />
              <Button type="submit" isLoading={saving} className="gap-2"><Save className="h-4 w-4" /> Save profile</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card><div className="font-serif text-3xl font-semibold text-[#17152D]">{garments.length}</div><p className="mt-1 text-sm text-[#857C73]">Wardrobe items</p></Card>
          <Card><div className="font-serif text-3xl font-semibold text-[#17152D]">{formatCurrency(stats.value)}</div><p className="mt-1 text-sm text-[#857C73]">Tracked value</p></Card>
          <Card><div className="font-serif text-3xl font-semibold text-[#17152D]">{stats.stitched}</div><p className="mt-1 text-sm text-[#857C73]">Stitching records</p></Card>
          <Card><div className="font-serif text-3xl font-semibold text-[#17152D]">{stats.worn}</div><p className="mt-1 text-sm text-[#857C73]">Pieces worn at least once</p></Card>
        </div>
      </div>
    </div>
  );
}
