"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useAddModal } from "@/lib/add-modal-context";
import { Heart, Plus, Shirt, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/closet",      label: "Closet" },
  { href: "/wishlist",    label: "Wishlist" },
  { href: "/recommended", label: "Recommended" },
  { href: "/profile",     label: "Profile" },
];

export function Navbar() {
  const { user } = useAuth();
  const { openAdd } = useAddModal();
  const pathname = usePathname();
  const initial = (user?.displayName || user?.email || "?")[0].toUpperCase();
  const photoUrl = user?.photoURL;

  return (
    <>
      {/* ── Top header (all screen sizes) ───────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E8E8E8] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/closet" className="text-xl font-bold tracking-tight text-[#111111]">
            vastra
          </Link>

          {/* Desktop pill tabs */}
          <nav className="hidden items-center gap-1 md:flex">
            {tabs.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                    active
                      ? "bg-[#111111] text-white"
                      : "text-[#888888] hover:text-[#111111] hover:bg-[#F5F5F5]"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop: avatar + add button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={openAdd}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] text-white shadow-sm transition hover:bg-[#333333] active:scale-95"
            >
              <Plus className="h-4 w-4" />
            </button>
            <Link href="/profile">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-[#E8E8E8]" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-white text-xs font-semibold">
                  {initial}
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Mobile bottom nav ───────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-[#E8E8E8] bg-white">
        <div className="flex items-center justify-around px-4 pb-safe">
          {/* Closet */}
          <NavItem href="/closet" label="Closet" pathname={pathname}>
            <Shirt className="h-6 w-6" />
          </NavItem>

          {/* Wishlist */}
          <NavItem href="/wishlist" label="Wishlist" pathname={pathname}>
            <Heart className="h-6 w-6" />
          </NavItem>

          {/* Centre add button */}
          <div className="flex flex-col items-center">
            <button
              onClick={openAdd}
              className="flex h-14 w-14 -mt-5 items-center justify-center rounded-full bg-[#111111] text-white shadow-lg transition active:scale-90"
            >
              <Plus className="h-6 w-6" strokeWidth={2.5} />
            </button>
          </div>

          {/* Recommended */}
          <NavItem href="/recommended" label="For You" pathname={pathname}>
            <Sparkles className="h-6 w-6" />
          </NavItem>

          {/* Profile — avatar circle */}
          <Link href="/profile" className="flex flex-col items-center gap-1 py-3">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className={cn(
                "h-7 w-7 rounded-full object-cover transition",
                pathname === "/profile" ? "ring-2 ring-[#111111]" : "ring-2 ring-[#E8E8E8]"
              )} />
            ) : (
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition",
                pathname === "/profile"
                  ? "bg-[#111111] text-white"
                  : "bg-[#E8E8E8] text-[#888888]"
              )}>
                {initial}
              </div>
            )}
            <span className={cn(
              "text-[10px] font-medium leading-none",
              pathname === "/profile" ? "text-[#111111]" : "text-[#C0C0C0]"
            )}>
              Profile
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
}

function NavItem({
  href, label, pathname, children,
}: {
  href: string; label: string; pathname: string; children: React.ReactNode;
}) {
  const active = pathname === href;
  return (
    <Link href={href} className="flex flex-col items-center gap-1 py-3 px-2">
      <span className={cn("transition", active ? "text-[#111111]" : "text-[#C0C0C0]")}>
        {children}
      </span>
      <span className={cn(
        "text-[10px] font-medium leading-none",
        active ? "text-[#111111]" : "text-[#C0C0C0]"
      )}>
        {label}
      </span>
    </Link>
  );
}
