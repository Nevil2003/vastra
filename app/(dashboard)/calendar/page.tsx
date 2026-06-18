"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Shirt, X } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { createItem, removeItem, updateItem } from "@/lib/firestore";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { cn } from "@/lib/utils";
import { Garment, Outfit, OutfitPlan } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ymd(d: Date) { return d.toISOString().split("T")[0]; }
function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }

const MONTH_NAMES = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ─── Plan Modal ───────────────────────────────────────────────────────────────

function PlanModal({
  open, onClose, date, outfits, garments, existingPlan,
}: {
  open: boolean; onClose: () => void; date: string;
  outfits: Outfit[]; garments: Garment[]; existingPlan?: OutfitPlan;
}) {
  const { user } = useAuth();
  const [selectedOutfit, setSelectedOutfit] = useState(existingPlan?.outfitId ?? "");
  const [occasion, setOccasion]             = useState(existingPlan?.occasion ?? "");
  const [notes, setNotes]                   = useState(existingPlan?.notes ?? "");
  const [loading, setLoading]               = useState(false);

  const garmentMap = useMemo(() => new Map(garments.map((g) => [g.id, g])), [garments]);

  async function save() {
    if (!user) return;
    setLoading(true);
    try {
      const chosenOutfit = outfits.find((o) => o.id === selectedOutfit);
      const data = {
        userId: user.uid,
        date,
        outfitId:   selectedOutfit || undefined,
        garmentIds: chosenOutfit?.garmentIds ?? [],
        occasion:   occasion || undefined,
        notes:      notes || undefined,
        worn:       existingPlan?.worn ?? false,
      };
      if (existingPlan) {
        await updateItem("outfitPlans", existingPlan.id, data);
      } else {
        await createItem("outfitPlans", data);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function markWorn() {
    if (!existingPlan || !user) return;
    setLoading(true);
    const nowWorn = !existingPlan.worn;
    await updateItem("outfitPlans", existingPlan.id, { worn: nowWorn });
    if (nowWorn) {
      const today = ymd(new Date());
      for (const gId of existingPlan.garmentIds) {
        const g = garmentMap.get(gId);
        if (g) await updateItem("garments", gId, { wearCount: (g.wearCount || 0) + 1, lastWorn: today });
      }
      if (existingPlan.outfitId) {
        const o = outfits.find((x) => x.id === existingPlan.outfitId);
        if (o) await updateItem("outfits", o.id, { wornCount: (o.wornCount || 0) + 1, lastWorn: today });
      }
    }
    setLoading(false);
    onClose();
  }

  const displayDate = new Date(date + "T12:00:00")
    .toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <Modal open={open} onClose={onClose} title={displayDate}>
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#888888]">Outfit</p>
          {outfits.length === 0 ? (
            <p className="text-sm text-[#AAAAAA]">No outfits yet — create one first</p>
          ) : (
            <div className="max-h-52 space-y-1.5 overflow-y-auto">
              <button type="button" onClick={() => setSelectedOutfit("")}
                className={cn("flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition text-left",
                  !selectedOutfit ? "border-[#111111] bg-[#111111] text-white" : "border-[#EEEEEE] hover:border-[#CCCCCC]"
                )}>
                <Shirt className="h-4 w-4 shrink-0" />
                <span>No outfit / just a note</span>
              </button>
              {outfits.map((o) => {
                const imgs = o.garmentIds.map((id) => garmentMap.get(id)).filter(Boolean).slice(0, 2);
                return (
                  <button key={o.id} type="button" onClick={() => setSelectedOutfit(o.id)}
                    className={cn("flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition text-left",
                      selectedOutfit === o.id ? "border-[#111111] bg-[#F8F8F8]" : "border-[#EEEEEE] hover:border-[#CCCCCC]"
                    )}>
                    <div className="flex shrink-0 -space-x-1">
                      {imgs.map((g, i) => (
                        <div key={i} className="h-8 w-8 overflow-hidden rounded-lg border-2 border-white bg-[#F0F0F0]">
                          {g?.imageUrl
                            ? <img src={g.imageUrl} alt="" className="h-full w-full object-cover" />  // eslint-disable-line @next/next/no-img-element
                            : <div className="flex h-full items-center justify-center"><div className="h-3 w-3 rounded-full" style={{ background: g?.color ?? "#ccc" }} /></div>
                          }
                        </div>
                      ))}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#111111]">{o.name}</p>
                      {o.occasion && <p className="text-[10px] text-[#AAAAAA]">{o.occasion}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <input className="w-full rounded-xl border border-[#E8E8E8] bg-white px-4 py-2.5 text-sm placeholder:text-[#AAAAAA] outline-none focus:border-[#111111] transition"
          placeholder="Occasion (optional)" value={occasion} onChange={(e) => setOccasion(e.target.value)} />

        <input className="w-full rounded-xl border border-[#E8E8E8] bg-white px-4 py-2.5 text-sm placeholder:text-[#AAAAAA] outline-none focus:border-[#111111] transition"
          placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="flex gap-2">
          <Button className="flex-1" onClick={save} isLoading={loading}>
            {existingPlan ? "Update" : "Save plan"}
          </Button>
          {existingPlan && (
            <Button variant="outline" onClick={markWorn} isLoading={loading}
              className={cn("flex-1", existingPlan.worn && "border-green-200 bg-green-50 text-green-700")}>
              {existingPlan.worn ? "Worn ✓" : "Mark worn"}
            </Button>
          )}
        </div>

        {existingPlan && (
          <button onClick={async () => { await removeItem("outfitPlans", existingPlan.id); onClose(); }}
            className="flex w-full items-center justify-center gap-1.5 py-2 text-xs text-red-400 transition hover:text-red-600">
            <X className="h-3.5 w-3.5" /> Remove plan
          </button>
        )}
      </div>
    </Modal>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const now  = new Date();
  const [year, setYear]     = useState(now.getFullYear());
  const [month, setMonth]   = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  const { items: plans }    = useUserCollection<OutfitPlan>("outfitPlans");
  const { items: outfits }  = useUserCollection<Outfit>("outfits");
  const { items: garments } = useUserCollection<Garment>("garments");

  const garmentMap = useMemo(() => new Map(garments.map((g) => [g.id, g])), [garments]);
  const outfitMap  = useMemo(() => new Map(outfits.map((o) => [o.id, o])), [outfits]);

  const plansByDate = useMemo(() => {
    const map = new Map<string, OutfitPlan[]>();
    for (const p of plans) {
      if (!map.has(p.date)) map.set(p.date, []);
      map.get(p.date)!.push(p);
    }
    return map;
  }, [plans]);

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  const days     = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const today    = ymd(now);

  const selectedDayPlans = selectedDate ? (plansByDate.get(selectedDate) ?? []) : [];
  const existingPlan = selectedDayPlans[0];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#111111]">Calendar</h1>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="rounded-full p-2 text-[#888888] transition hover:bg-[#F5F5F5]">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[140px] text-center text-sm font-semibold text-[#111111]">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={nextMonth} className="rounded-full p-2 text-[#888888] transition hover:bg-[#F5F5F5]">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl border border-[#F0F0F0] bg-white p-3 shadow-sm">
        <div className="mb-1 grid grid-cols-7">
          {DAY_LABELS.map((d) => (
            <div key={d} className="py-1 text-center text-[10px] font-semibold text-[#CCCCCC]">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: days }).map((_, i) => {
            const day     = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday    = dateStr === today;
            const isSelected = selectedDate === dateStr;
            const dayPlans   = plansByDate.get(dateStr) ?? [];
            const hasPlan    = dayPlans.length > 0;
            const hasWorn    = dayPlans.some((p) => p.worn);
            const thumbImg   = dayPlans[0]?.outfitId
              ? outfitMap.get(dayPlans[0].outfitId)?.garmentIds
                .map((id) => garmentMap.get(id)).find((g) => g?.imageUrl)?.imageUrl
              : undefined;

            return (
              <button key={day} type="button" onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={cn(
                  "relative flex flex-col items-center justify-start rounded-xl pb-1 pt-1.5 transition-all hover:bg-[#F8F8F8]",
                  isToday && !isSelected && "ring-2 ring-[#111111]",
                  isSelected && "bg-[#111111] hover:bg-[#333333]",
                  hasPlan && !isSelected && "bg-[#F5F5F5]"
                )}
                style={{ minHeight: 52 }}
              >
                <span className={cn("text-sm font-semibold leading-none",
                  isSelected ? "text-white" : isToday ? "text-[#111111]" : "text-[#888888]"
                )}>{day}</span>
                {thumbImg ? (
                  <div className="mt-1 h-6 w-6 overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbImg} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : hasPlan ? (
                  <div className={cn("mt-1 h-1.5 w-1.5 rounded-full",
                    hasWorn ? "bg-green-400" : isSelected ? "bg-white" : "bg-[#111111]"
                  )} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div className="animate-rise rounded-2xl border border-[#F0F0F0] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#111111]">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </h2>
            <button onClick={() => setSelectedDate(null)} className="rounded-full p-1.5 text-[#CCCCCC] transition hover:text-[#888888]">
              <X className="h-4 w-4" />
            </button>
          </div>

          {selectedDayPlans.length > 0 ? (
            <div className="space-y-2">
              {selectedDayPlans.map((plan) => {
                const outfit = plan.outfitId ? outfitMap.get(plan.outfitId) : undefined;
                const imgs = (plan.garmentIds ?? []).map((id) => garmentMap.get(id)).filter(Boolean).slice(0, 3);
                return (
                  <div key={plan.id} className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5",
                    plan.worn ? "border-green-100 bg-green-50" : "border-[#EEEEEE]"
                  )}>
                    <div className="flex shrink-0 -space-x-1">
                      {imgs.map((g, i) => (
                        <div key={i} className="h-9 w-9 overflow-hidden rounded-lg border-2 border-white bg-[#F0F0F0]">
                          {g?.imageUrl
                            ? <img src={g.imageUrl} alt="" className="h-full w-full object-cover" />  // eslint-disable-line @next/next/no-img-element
                            : <div className="flex h-full items-center justify-center"><Shirt className="h-4 w-4 text-[#D0D0D0]" /></div>
                          }
                        </div>
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#111111]">{outfit?.name ?? plan.occasion ?? "Outfit plan"}</p>
                      {plan.occasion && <p className="text-xs text-[#AAAAAA]">{plan.occasion}</p>}
                    </div>
                    {plan.worn && <span className="shrink-0 text-xs font-medium text-green-600">Worn ✓</span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mb-3 text-sm text-[#AAAAAA]">Nothing planned for this day.</p>
          )}

          <Button className="mt-3 w-full gap-1.5" onClick={() => setPlanModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {existingPlan ? "Edit plan" : "Plan outfit"}
          </Button>
        </div>
      )}

      {/* Upcoming */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#888888]">Upcoming</p>
        {plans.filter((p) => p.date >= today && !p.worn).length === 0 ? (
          <p className="text-sm text-[#AAAAAA]">No upcoming outfit plans</p>
        ) : (
          <div className="space-y-2">
            {plans.filter((p) => p.date >= today && !p.worn)
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 7)
              .map((plan) => {
                const outfit = plan.outfitId ? outfitMap.get(plan.outfitId) : undefined;
                const imgs = (plan.garmentIds ?? []).map((id) => garmentMap.get(id)).filter(Boolean).slice(0, 2);
                return (
                  <button key={plan.id} type="button"
                    onClick={() => {
                      const d = new Date(plan.date + "T12:00:00");
                      setYear(d.getFullYear()); setMonth(d.getMonth()); setSelectedDate(plan.date);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl border border-[#F0F0F0] bg-white px-4 py-3 text-left transition hover:border-[#DDDDDD] hover:shadow-sm"
                  >
                    <div className="flex shrink-0 -space-x-1">
                      {imgs.map((g, i) => (
                        <div key={i} className="h-10 w-10 overflow-hidden rounded-xl border-2 border-white bg-[#F0F0F0]">
                          {g?.imageUrl
                            ? <img src={g.imageUrl} alt="" className="h-full w-full object-cover" />  // eslint-disable-line @next/next/no-img-element
                            : <div className="flex h-full items-center justify-center"><Shirt className="h-4 w-4 text-[#D0D0D0]" /></div>
                          }
                        </div>
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#111111]">{outfit?.name ?? plan.occasion ?? "Outfit plan"}</p>
                      <p className="text-xs text-[#AAAAAA]">
                        {new Date(plan.date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#CCCCCC]" />
                  </button>
                );
              })
            }
          </div>
        )}
      </div>

      {/* Plan modal */}
      {selectedDate && (
        <PlanModal
          open={planModalOpen}
          onClose={() => setPlanModalOpen(false)}
          date={selectedDate}
          outfits={outfits}
          garments={garments}
          existingPlan={existingPlan}
        />
      )}
    </div>
  );
}
