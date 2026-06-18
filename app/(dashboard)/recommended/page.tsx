"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Shirt, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { Garment, WishlistItem } from "@/types";

function ItemCard({ imageUrl, name, sub }: { imageUrl?: string; name: string; sub: string }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#F5F5F5]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Shirt className="h-10 w-10 text-[#D0D0D0]" />
          </div>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <p className="truncate text-sm font-medium text-[#111111]">{name}</p>
        <p className="text-xs text-[#888888]">{sub}</p>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
  emptyText,
  isEmpty,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  emptyText?: string;
  isEmpty?: boolean;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[#111111]">{title}</h2>
        {subtitle && <p className="text-sm text-[#888888]">{subtitle}</p>}
      </div>
      {isEmpty ? (
        <p className="rounded-2xl border border-dashed border-[#E8E8E8] bg-white py-8 text-center text-sm text-[#AAAAAA]">
          {emptyText}
        </p>
      ) : (
        children
      )}
    </section>
  );
}

export default function RecommendedPage() {
  const { items: garments } = useUserCollection<Garment>("garments");
  const { items: wishlist } = useUserCollection<WishlistItem>("wishlist");

  const unworn = garments.filter((g) => g.wearCount === 0).slice(0, 8);
  const recentlyAdded = [...garments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
  const topWishlist = wishlist
    .filter((w) => !w.purchased)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 8);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[#111111]" />
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">For You</h1>
          <p className="mt-0.5 text-sm text-[#888888]">Pieces worth wearing again</p>
        </div>
      </div>

      {/* Unworn gems */}
      <Section
        title="Wear more of these"
        subtitle="Items in your closet you haven't worn yet"
        isEmpty={unworn.length === 0}
        emptyText="Add items to your closet to see suggestions here"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {unworn.map((g) => (
            <ItemCard key={g.id} imageUrl={g.imageUrl} name={g.name} sub={`${g.category} · never worn`} />
          ))}
        </div>
        {garments.length > 0 && unworn.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[#E8E8E8] bg-white py-8 text-center text-sm text-[#AAAAAA]">
            Everything in your closet has been worn — great job!
          </p>
        )}
      </Section>

      {/* Recently added */}
      <Section
        title="Recently added"
        subtitle="The latest arrivals in your closet"
        isEmpty={recentlyAdded.length === 0}
        emptyText="Your closet is empty — add some items"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {recentlyAdded.map((g) => (
            <ItemCard key={g.id} imageUrl={g.imageUrl} name={g.name} sub={g.category} />
          ))}
        </div>
      </Section>

      {/* Wishlist reminders */}
      <Section
        title="On your wishlist"
        subtitle="Top picks you've been saving"
        isEmpty={topWishlist.length === 0}
        emptyText="Nothing on your wishlist yet"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {topWishlist.map((w) => (
            <div key={w.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#F5F5F5]">
                {w.imageUrl ? (
                  <Image
                    src={w.imageUrl}
                    alt={w.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Heart className="h-10 w-10 text-[#D0D0D0]" />
                  </div>
                )}
                <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-[#111111] capitalize">
                  {w.priority}
                </span>
              </div>
              <div className="mt-2 px-0.5">
                <p className="truncate text-sm font-medium text-[#111111]">{w.name}</p>
                <p className="text-xs text-[#888888]">{w.category}</p>
              </div>
            </div>
          ))}
        </div>
        {topWishlist.length > 0 && (
          <div className="pt-2">
            <Link href="/wishlist">
              <Button variant="secondary" size="sm">View full wishlist</Button>
            </Link>
          </div>
        )}
      </Section>
    </div>
  );
}
