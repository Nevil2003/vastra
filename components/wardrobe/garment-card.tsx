"use client";

import { Clock, IndianRupee, Scissors, Shirt } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Garment } from "@/types";

export function GarmentCard({ garment, selected, onClick }: { garment: Garment; selected?: boolean; onClick?: () => void }) {
  const costPerWear = garment.price && garment.wearCount ? Math.round(garment.price / garment.wearCount) : null;

  return (
    <Card
      hover
      className={selected ? "border-[#3C3489] ring-2 ring-[#3C3489]/15" : ""}
    >
      <button type="button" onClick={onClick} className="block w-full text-left">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#EFE6D8]">
          {garment.imageUrl ? (
            <Image src={garment.imageUrl} alt={garment.name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Shirt className="h-12 w-12 text-[#3C3489]/35" />
            </div>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-semibold leading-tight text-[#17152D]">{garment.name}</h3>
            <p className="mt-1 text-sm text-[#5F596B]">{garment.category} · {garment.colorName}</p>
          </div>
          <span className="h-5 w-5 shrink-0 rounded-full border border-[#E5DACB]" style={{ background: garment.color }} />
        </div>
        <div className="mt-4 grid gap-2 text-sm text-[#5F596B]">
          {garment.price ? (
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-[#3C3489]" />
              {formatCurrency(garment.price)}
              {costPerWear ? <span className="text-[#8A8178]">· {formatCurrency(costPerWear)}/wear</span> : null}
            </div>
          ) : null}
          {garment.stitchingStatus !== "not-needed" ? (
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-[#C8793D]" />
              {garment.stitchingStatus.replace("-", " ")}
            </div>
          ) : null}
          {garment.stitchingDueDate ? (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#3C3489]" />
              Due {new Date(garment.stitchingDueDate).toLocaleDateString("en-IN")}
            </div>
          ) : null}
        </div>
      </button>
    </Card>
  );
}
