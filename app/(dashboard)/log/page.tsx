"use client";

import { FormEvent, useMemo, useState } from "react";
import { increment } from "firebase/firestore";
import { CheckCircle2, Plus } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createItem, updateItem } from "@/lib/firestore";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { Garment, Outfit, WearLog } from "@/types";

export default function WearLogPage() {
  const { user } = useAuth();
  const { items: garments } = useUserCollection<Garment>("garments");
  const { items: outfits } = useUserCollection<Outfit>("outfits");
  const { items: logs } = useUserCollection<WearLog>("wearLogs");
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), outfitId: "", garmentId: "", occasion: "", notes: "" });

  const streak = useMemo(() => {
    const dates = new Set(logs.map((log) => log.date));
    let count = 0;
    const day = new Date();
    while (dates.has(day.toISOString().slice(0, 10))) {
      count += 1;
      day.setDate(day.getDate() - 1);
    }
    return count;
  }, [logs]);

  function setField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const outfit = outfits.find((item) => item.id === form.outfitId);
    const garmentIds = outfit?.garmentIds || (form.garmentId ? [form.garmentId] : []);
    if (!garmentIds.length) return;

    await createItem<Omit<WearLog, "id" | "createdAt">>("wearLogs", {
      userId: user.uid,
      date: form.date,
      outfitId: form.outfitId,
      garmentIds,
      occasion: form.occasion,
      notes: form.notes,
    });
    if (outfit) await updateItem("outfits", outfit.id, { wornCount: increment(1), lastWorn: form.date });
    await Promise.all(garmentIds.map((id) => {
      const garment = garments.find((item) => item.id === id);
      return garment ? updateItem("garments", id, { wearCount: increment(1), lastWorn: form.date }) : Promise.resolve();
    }));
    setForm({ date: new Date().toISOString().slice(0, 10), outfitId: "", garmentId: "", occasion: "", notes: "" });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#3C3489]">Wear Log</p>
        <h1 className="font-serif text-4xl font-semibold text-[#17152D]">Track what you wore</h1>
        <p className="mt-2 text-[#5F596B]">Build cost-per-wear and repeat history one day at a time.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit">
          <CardTitle>Log today</CardTitle>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <Input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} />
              <Select value={form.outfitId} onChange={(e) => setField("outfitId", e.target.value)}>
                <option value="">Choose saved outfit</option>
                {outfits.map((outfit) => <option key={outfit.id} value={outfit.id}>{outfit.name}</option>)}
              </Select>
              <Select value={form.garmentId} onChange={(e) => setField("garmentId", e.target.value)} disabled={Boolean(form.outfitId)}>
                <option value="">Or choose one garment</option>
                {garments.map((garment) => <option key={garment.id} value={garment.id}>{garment.name}</option>)}
              </Select>
              <Input placeholder="Occasion" value={form.occasion} onChange={(e) => setField("occasion", e.target.value)} />
              <Input placeholder="Notes" value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
              <Button type="submit" className="w-full gap-2"><Plus className="h-4 w-4" /> Add log</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><div className="font-serif text-3xl font-semibold text-[#17152D]">{logs.length}</div><p className="mt-1 text-sm text-[#857C73]">Total logs</p></Card>
            <Card><div className="font-serif text-3xl font-semibold text-[#17152D]">{streak}</div><p className="mt-1 text-sm text-[#857C73]">Day streak</p></Card>
            <Card><div className="font-serif text-3xl font-semibold text-[#17152D]">{garments.filter((item) => item.wearCount === 0).length}</div><p className="mt-1 text-sm text-[#857C73]">Never worn</p></Card>
          </div>
          <Card>
            <CardTitle>History</CardTitle>
            <CardContent className="space-y-3">
              {logs.length ? logs.map((log) => {
                const outfit = outfits.find((item) => item.id === log.outfitId);
                const names = log.garmentIds.map((id) => garments.find((item) => item.id === id)?.name).filter(Boolean);
                return (
                  <div key={log.id} className="rounded-2xl bg-[#F8F3EA] p-4">
                    <div className="flex items-center gap-2 font-medium text-[#17152D]">
                      <CheckCircle2 className="h-4 w-4 text-[#3C3489]" />
                      {new Date(log.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </div>
                    <p className="mt-2 text-sm text-[#5F596B]">{outfit?.name || names.join(", ")}</p>
                    {log.occasion ? <p className="mt-1 text-xs uppercase tracking-wide text-[#857C73]">{log.occasion}</p> : null}
                  </div>
                );
              }) : <p className="text-sm text-[#857C73]">No wear logs yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
