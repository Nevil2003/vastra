"use client";

import Link from "next/link";
import { ArrowRight, Heart, Shirt, Sparkles } from "lucide-react";
import { useAddModal } from "@/lib/add-modal-context";
import { useUserCollection } from "@/lib/hooks/use-user-collection";
import { cn } from "@/lib/utils";
import { Garment, WishlistItem } from "@/types";

// ─── Carousel ────────────────────────────────────────────────────────────────

function Carousel({
  title,
  subtitle,
  viewAll,
  children,
  empty,
}: {
  title: string;
  subtitle?: string;
  viewAll?: string;
  children: React.ReactNode;
  empty?: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-base font-bold text-[#111111]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-[#AAAAAA]">{subtitle}</p>}
        </div>
        {viewAll && (
          <Link href={viewAll} className="flex items-center gap-0.5 text-xs font-medium text-[#888888] hover:text-[#111111] transition-colors">
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {empty ?? (
        <div className="-mx-4 overflow-x-auto scrollbar-hide px-4">
          <div className="flex gap-3 pb-1">
            {children}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ItemCard({
  imageUrl,
  name,
  sub,
  badge,
  badgeColor,
}: {
  imageUrl?: string;
  name: string;
  sub: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div className="group w-32 shrink-0 cursor-pointer sm:w-36">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#F5F5F5]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Shirt className="h-8 w-8 text-[#D8D8D8]" />
          </div>
        )}
        {badge && (
          <span className={cn(
            "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-semibold",
            badgeColor || "bg-white/90 text-[#111111]"
          )}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-1.5 space-y-0.5">
        <p className="truncate text-xs font-semibold text-[#111111]">{name}</p>
        <p className="truncate text-[10px] text-[#AAAAAA]">{sub}</p>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

function EmptyRow({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-[#EEEEEE] py-8 text-center text-xs text-[#CCCCCC]">
      {text}
    </p>
  );
}

export default function RecommendedPage() {
  const { openAdd } = useAddModal();
  const { items: garments } = useUserCollection<Garment>("garments");
  const { items: wishlist } = useUserCollection<WishlistItem>("wishlist");

  const unworn = garments.filter((g) => g.wearCount === 0).slice(0, 12);
  const recentlyAdded = [...garments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);
  const mostWorn = [...garments]
    .filter((g) => g.wearCount > 0)
    .sort((a, b) => b.wearCount - a.wearCount)
    .slice(0, 12);
  const topWishlist = wishlist
    .filter((w) => !w.purchased)
    .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]))
    .slice(0, 12);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#111111]" />
          <h1 className="text-2xl font-bold text-[#111111]">For You</h1>
        </div>
        <p className="mt-0.5 text-sm text-[#888888]">Curated from your wardrobe</p>
      </div>

      {/* Wear more of these */}
      <Carousel
        title="Wear more of these"
        subtitle="Items you haven't tried yet"
        viewAll="/closet"
        empty={
          unworn.length === 0
            ? garments.length === 0
              ? <EmptyRow text="Add items to your closet to see suggestions" />
              : <EmptyRow text="Everything in your closet has been worn — great job!" />
            : undefined
        }
      >
        {unworn.map((g) => (
          <ItemCard key={g.id} imageUrl={g.imageUrl} name={g.name} sub="Never worn" />
        ))}
      </Carousel>

      {/* Recently added */}
      <Carousel
        title="Recently added"
        subtitle="The latest arrivals"
        viewAll="/closet"
        empty={recentlyAdded.length === 0 ? <EmptyRow text="Your closet is empty" /> : undefined}
      >
        {recentlyAdded.map((g) => (
          <ItemCard key={g.id} imageUrl={g.imageUrl} name={g.name} sub={g.category} />
        ))}
      </Carousel>

      {/* Most worn */}
      {mostWorn.length > 0 && (
        <Carousel
          title="Your favourites"
          subtitle="Most worn pieces in your wardrobe"
          viewAll="/closet"
        >
          {mostWorn.map((g) => (
            <ItemCard key={g.id} imageUrl={g.imageUrl} name={g.name} sub={`Worn ${g.wearCount}×`} />
          ))}
        </Carousel>
      )}

      {/* Wishlist reminders */}
      <Carousel
        title="Still on your wishlist"
        subtitle="Pieces you've been saving"
        viewAll="/wishlist"
        empty={topWishlist.length === 0 ? <EmptyRow text="Nothing on your wishlist yet" /> : undefined}
      >
        {topWishlist.map((w) => (
          <ItemCard
            key={w.id}
            imageUrl={w.imageUrl}
            name={w.name}
            sub={w.category}
            badge={w.priority === "high" ? "High" : undefined}
            badgeColor={w.priority === "high" ? "bg-red-100 text-red-600" : undefined}
          />
        ))}
      </Carousel>

      {/* Empty state CTA */}
      {garments.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-[#EEEEEE] py-16 text-center">
          <div className="flex items-center gap-3">
            <Shirt className="h-8 w-8 text-[#E0E0E0]" />
            <Heart className="h-8 w-8 text-[#E0E0E0]" />
          </div>
          <div>
            <p className="font-semibold text-[#888888]">Your wardrobe is waiting</p>
            <p className="mt-1 text-sm text-[#BBBBBB]">Add items to your closet to see curated picks here</p>
          </div>
          <button
            onClick={openAdd}
            className="rounded-full bg-[#111111] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#333333]"
          >
            Add your first item
          </button>
        </div>
      )}
    </div>
  );
}
