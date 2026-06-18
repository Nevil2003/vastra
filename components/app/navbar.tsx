"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { CalendarDays, Heart, Home, LogOut, Menu, NotebookText, Palette, Ruler, Shirt, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/outfits", label: "Outfits", icon: Palette },
  { href: "/occasions", label: "Occasions", icon: CalendarDays },
  { href: "/log", label: "Wear Log", icon: NotebookText },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/profile", label: "Profile", icon: Ruler },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#17152D]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/home" className="font-serif text-2xl font-semibold tracking-[0.18em] text-[#F4DFB5]">
          VASTRA <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">closet</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/82 transition hover:bg-white/10 hover:text-[#F4DFB5]",
                pathname === link.href && "bg-white/12 text-[#F4DFB5]"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="max-w-36 truncate text-sm text-white/70">{user?.displayName || user?.email}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="text-white/70 hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <button className="text-white md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#17152D] px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn("flex items-center gap-2 py-2 text-sm text-white/90", pathname === link.href && "text-[#F4DFB5]")}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <button onClick={logout} className="flex w-full items-center gap-2 py-2 text-sm text-red-300">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      )}
    </header>
  );
}
