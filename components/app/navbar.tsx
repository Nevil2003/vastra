"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AddWishlistModal } from "@/components/wardrobe/add-wishlist-modal";
import { useAddModal } from "@/lib/add-modal-context";
import { cn } from "@/lib/utils";
import { Heart, Home, Plus, Shirt, Store, User } from "lucide-react";

export function Navbar() {
  const { openAdd } = useAddModal();
  const pathname = usePathname();
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const isWishlist = pathname === "/wishlist" || pathname.startsWith("/wishlist/");

  function handleAdd() {
    if (isWishlist) {
      setWishlistOpen(true);
      return;
    }

    openAdd();
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#070707]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-around px-2">
          <BottomNavItem href="/today" label="Home" pathname={pathname}>
            <Home className="h-5 w-5" />
          </BottomNavItem>

          <BottomNavItem href="/closet" label="Clothing" pathname={pathname}>
            <Shirt className="h-5 w-5" />
          </BottomNavItem>

          <BottomNavItem href="/brands" label="Brands" pathname={pathname}>
            <Store className="h-5 w-5" />
          </BottomNavItem>

          <div className="flex flex-col items-center -mt-5">
            <button
              onClick={handleAdd}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-[#F7FBFF] text-[#070707] shadow-[0_12px_28px_rgba(0,0,0,0.35)] transition-transform active:scale-95"
            >
              <Plus className="h-6 w-6" strokeWidth={2.5} />
            </button>
          </div>

          <BottomNavItem href="/wishlist" label="Wishlist" pathname={pathname}>
            <Heart className="h-5 w-5" />
          </BottomNavItem>

          <BottomNavItem href="/profile" label="Profile" pathname={pathname}>
            <User className="h-5 w-5" />
          </BottomNavItem>
        </div>
      </nav>
      <AddWishlistModal open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </>
  );
}

function BottomNavItem({
  href,
  label,
  pathname,
  children,
}: {
  href: string;
  label: string;
  pathname: string;
  children: React.ReactNode;
}) {
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link href={href} className="flex min-w-[2.75rem] flex-col items-center gap-1 px-2 py-2">
      <span className={cn("transition", active ? "text-cyan-100" : "text-white/35")}>
        {children}
      </span>
      <span
        className={cn(
          "text-[10px] leading-none",
          active ? "font-bold text-white" : "font-medium text-white/35"
        )}
      >
        {label}
      </span>
    </Link>
  );
}
