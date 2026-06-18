"use client";

import { FormEvent, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { createItem } from "@/lib/firestore";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { Garment, Occasion, Outfit } from "@/types";

export default function OccasionsPage() {
  const { user } = useAuth();
  const { items: occasions } = useUserCollection<Occasion>("occasions");
  const { items: outfits } = useUserCollection<Outfit>("outfits");
  const { items: garments } = useUserCollection<Garment>("garments");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", type: "wedding", location: "", outfitId: "", notes: "" });

  function setField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const outfit = outfits.find((item) => item.id === form.outfitId);
    await createItem<Omit<Occasion, "id" | "createdAt" | "updatedAt">>("occasions", {
      userId: user.uid,
      title: form.title,
      date: form.date,
      type: form.type as Occasion["type"],
      location: form.location,
      outfitId: form.outfitId,
      garmentIds: outfit?.garmentIds || [],
      notes: form.notes,
    });
    setOpen(false);
    setForm({ title: "", date: "", type: "wedding", location: "", outfitId: "", notes: "" });
  }

  const upcoming = occasions.filter((item) => new Date(item.date) >= new Date(new Date().toDateString()));
  const past = occasions.filter((item) => new Date(item.date) < new Date(new Date().toDateString()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#3C3489]">Occasions</p>
          <h1 className="font-serif text-4xl font-semibold text-[#17152D]">Plan what to wear</h1>
          <p className="mt-2 text-[#5F596B]">Weddings, office days, festivals, trips, parties, and daily plans.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2"><CalendarPlus className="h-4 w-4" /> Add occasion</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>Upcoming</CardTitle>
          <CardContent className="space-y-3">
            {upcoming.length ? upcoming.map((occasion) => (
              <OccasionRow key={occasion.id} occasion={occasion} outfits={outfits} garments={garments} />
            )) : <p className="text-sm text-[#857C73]">No upcoming occasions yet.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardTitle>Past</CardTitle>
          <CardContent className="space-y-3">
            {past.length ? past.map((occasion) => (
              <OccasionRow key={occasion.id} occasion={occasion} outfits={outfits} garments={garments} compact />
            )) : <p className="text-sm text-[#857C73]">Past occasions will collect here.</p>}
          </CardContent>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add occasion">
        <form onSubmit={submit} className="space-y-3">
          <Input required placeholder="Occasion title" value={form.title} onChange={(e) => setField("title", e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input required type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} />
            <Select value={form.type} onChange={(e) => setField("type", e.target.value)}>
              <option value="wedding">Wedding</option>
              <option value="work">Work</option>
              <option value="travel">Travel</option>
              <option value="festival">Festival</option>
              <option value="party">Party</option>
              <option value="casual">Casual</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <Input placeholder="Location" value={form.location} onChange={(e) => setField("location", e.target.value)} />
          <Select value={form.outfitId} onChange={(e) => setField("outfitId", e.target.value)}>
            <option value="">Attach saved look</option>
            {outfits.map((outfit) => <option key={outfit.id} value={outfit.id}>{outfit.name}</option>)}
          </Select>
          <Input placeholder="Notes" value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
          <Button type="submit" className="w-full">Save occasion</Button>
        </form>
      </Modal>
    </div>
  );
}

function OccasionRow({ occasion, outfits, garments, compact }: { occasion: Occasion; outfits: Outfit[]; garments: Garment[]; compact?: boolean }) {
  const outfit = outfits.find((item) => item.id === occasion.outfitId);
  const pieces = occasion.garmentIds.map((id) => garments.find((item) => item.id === id)?.name).filter(Boolean);

  return (
    <div className="rounded-2xl border border-[#E5DACB] bg-[#F8F3EA] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-semibold text-[#17152D]">{occasion.title}</h3>
          <p className="text-sm text-[#857C73]">{new Date(occasion.date).toLocaleDateString("en-IN", { dateStyle: "medium" })} · {occasion.type}</p>
        </div>
        {!compact && <span className="rounded-full bg-[#EEE5FF] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#3C3489]">{occasion.location || "Planned"}</span>}
      </div>
      {outfit ? <p className="mt-3 font-medium text-[#211F32]">{outfit.name}</p> : null}
      {pieces.length ? <p className="mt-1 text-sm text-[#5F596B]">{pieces.join(", ")}</p> : null}
      {occasion.notes ? <p className="mt-3 text-sm text-[#5F596B]">{occasion.notes}</p> : null}
    </div>
  );
}
