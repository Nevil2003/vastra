"use client";

import { Heart, Shirt } from "lucide-react";
import { Garment, Outfit } from "@/types";

interface Props {
  outfit: Outfit;
  garmentMap: Map<string, Garment>;
  onClick?: () => void;
}

export function OutfitCard({ outfit, garmentMap, onClick }: Props) {
  const images = outfit.garmentIds
    .map((id) => garmentMap.get(id))
    .filter((g): g is Garment => Boolean(g))
    .slice(0, 4);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left transition-all duration-200 active:scale-[0.98]"
    >
      {/* Collage */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F5F5F5]">
        {images.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Shirt className="h-10 w-10 text-[#D8D8D8]" />
          </div>
        ) : images.length === 1 ? (
          images[0].imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[0].imageUrl}
              alt={images[0].name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="h-12 w-12 rounded-full border-2 border-white shadow" style={{ background: images[0].color }} />
            </div>
          )
        ) : (
          // 2×2 grid collage
          <div className="grid h-full grid-cols-2 gap-0.5">
            {[0, 1, 2, 3].map((i) => {
              const g = images[i];
              return (
                <div key={i} className="relative overflow-hidden bg-[#EEEEEE]">
                  {g?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.imageUrl}
                      alt={g.name}
                      className="h-full w-full object-cover"
                    />
                  ) : g ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-5 w-5 rounded-full border border-white shadow-sm" style={{ background: g.color }} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {/* Favorite badge */}
        {outfit.favorite && (
          <div className="absolute left-2 top-2">
            <Heart className="h-4 w-4 fill-[#EF4444] text-[#EF4444] drop-shadow" />
          </div>
        )}

        {/* Worn count badge */}
        {outfit.wornCount > 0 && (
          <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
            {outfit.wornCount}×
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 px-0.5">
        <p className="truncate text-sm font-semibold text-[#111111]">{outfit.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#AAAAAA]">
          {outfit.occasion && <span>{outfit.occasion}</span>}
          {outfit.occasion && outfit.season && <span>·</span>}
          {outfit.season && <span>{outfit.season}</span>}
          {!outfit.occasion && !outfit.season && (
            <span>{outfit.garmentIds.length} item{outfit.garmentIds.length !== 1 ? "s" : ""}</span>
          )}
        </p>
      </div>
    </button>
  );
}
