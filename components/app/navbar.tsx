"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Sparkles, Shirt, Palette, Ruler, Heart, Crown, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/closet", label: "Closet", icon: Shirt },
  { href: "/builder", label: "Builder", icon: Palette },
  { href: "/outfits", label: "Outfits", icon: Sparkles },
  { href: "/sizes", label: "Sizes", icon: Ruler },
  { href: "/brands", label: "Brands", icon: Heart },
  { href: "/pro", label: "Pro", icon: Crown },
];

export function Navbar() {
  const { user, mutate } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await mutate(null);
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E7D9C8] bg-[#171012]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-[0.18em] text-[#F3DFA9]">
          VASTRA <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">atelier</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/82 transition hover:bg-white/10 hover:text-[#F3DFA9]"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user?.plan === "pro" && (
            <span className="rounded-full bg-[#D69A2D] px-2 py-0.5 text-xs font-bold text-[#171012]">
              PRO
            </span>
          )}
          <span className="text-sm text-white/70">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="text-white/70 hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        <button className="text-white md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#1A1410] px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 py-2 text-sm text-white/90"
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
