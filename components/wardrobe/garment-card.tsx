"use client";

import Image from "next/image";
import { Shirt } from "lucide-react";
import { Garment } from "@/types";
import { cn } from "@/lib/utils";

export function GarmentCard({
  garment,
  selected,
  onClick,
}: {
  garment: Garment;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full text-left transition-all duration-200",
        selected && "ring-2 ring-[#111111] ring-offset-2 rounded-2xl"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#F5F5F5]">
        {garment.imageUrl ? (
          <Image
            src={garment.imageUrl}
            alt={garment.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Shirt className="h-10 w-10 text-[#D0D0D0]" />
          </div>
        )}
        {/* Color dot */}
        <span
          className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white shadow-sm"
          style={{ background: garment.color }}
        />
      </div>

      {/* Info */}
      <div className="mt-2 px-0.5">
        <p className="truncate text-sm font-medium text-[#111111]">{garment.name}</p>
        <p className="text-xs text-[#888888]">{garment.category}</p>
        {garment.wearCount > 0 && (
          <p className="text-xs text-[#AAAAAA]">Worn {garment.wearCount}×</p>
        )}
      </div>
    </button>
  );
}
