"use client";

import { Shirt } from "lucide-react";
import { Garment } from "@/types";
import { cn } from "@/lib/utils";

type ViewMode = "grid2" | "grid3" | "list";

export function GarmentCard({
  garment,
  selected,
  onClick,
  viewMode = "grid2",
}: {
  garment: Garment;
  selected?: boolean;
  onClick?: () => void;
  viewMode?: ViewMode;
}) {
  if (viewMode === "list") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group flex w-full items-center gap-3 rounded-2xl border border-[#F0F0F0] bg-white px-3 py-3 text-left transition-all duration-200 hover:border-[#DDDDDD] hover:shadow-sm active:scale-[0.99]",
          selected && "border-[#111111] ring-1 ring-[#111111]"
        )}
      >
        {/* Thumbnail */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F5F5F5]">
          {garment.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={garment.imageUrl} alt={garment.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Shirt className="h-6 w-6 text-[#D0D0D0]" />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#111111]">{garment.name}</p>
          <p className="mt-0.5 text-xs text-[#AAAAAA]">
            {garment.category}{garment.brand ? ` · ${garment.brand}` : ""}
          </p>
        </div>
        {/* Color + wear */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="h-4 w-4 rounded-full border border-white shadow-sm" style={{ background: garment.color }} />
          {garment.wearCount > 0 && (
            <span className="text-[10px] text-[#BBBBBB]">{garment.wearCount}×</span>
          )}
        </div>
      </button>
    );
  }

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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={garment.imageUrl}
            alt={garment.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Shirt className={cn("text-[#D0D0D0]", viewMode === "grid3" ? "h-6 w-6" : "h-10 w-10")} />
          </div>
        )}
        {/* Color dot */}
        <span
          className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
          style={{ background: garment.color }}
        />
      </div>

      {/* Info */}
      <div className="mt-1.5 px-0.5">
        <p className={cn("truncate font-medium text-[#111111]", viewMode === "grid3" ? "text-xs" : "text-sm")}>
          {garment.name}
        </p>
        <p className={cn("text-[#AAAAAA]", viewMode === "grid3" ? "text-[10px]" : "text-xs")}>
          {garment.category}
        </p>
      </div>
    </button>
  );
}
