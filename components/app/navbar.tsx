"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Heart, Shirt, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/closet", label: "Closet", icon: Shirt },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/recommended", label: "Recommended", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const initial = (user?.displayName || user?.email || "?")[0].toUpperCase();

  return (
    <>
      {/* Top header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E8E8E8] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/closet" className="text-xl font-bold tracking-tight text-[#111111]">
            vastra
          </Link>

          {/* Desktop nav tabs */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                    active
                      ? "bg-[#111111] text-white"
                      : "text-[#888888] hover:text-[#111111] hover:bg-[#F5F5F5]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User avatar */}
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-[#888888] md:block truncate max-w-36">
              {user?.displayName || user?.email}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-white text-xs font-semibold">
              {initial}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-[#E8E8E8] bg-white">
        <div className="flex items-center justify-around px-2 py-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors min-w-0",
                  active ? "text-[#111111]" : "text-[#C0C0C0]"
                )}
              >
                <link.icon
                  className="h-5 w-5"
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className="text-[10px] font-medium leading-none">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
