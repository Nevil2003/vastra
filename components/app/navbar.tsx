"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAddModal } from "@/lib/add-modal-context";
import { Home, Plus, Search, Shirt, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { openAdd } = useAddModal();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white">
      <div className="flex items-center justify-around px-2 h-16 max-w-5xl mx-auto">
        {/* Home */}
        <BottomNavItem href="/today" label="Home" pathname={pathname}>
          <Home className="h-5 w-5" />
        </BottomNavItem>

        {/* Clothing */}
        <BottomNavItem href="/closet" label="Clothing" pathname={pathname}>
          <Shirt className="h-5 w-5" />
        </BottomNavItem>

        {/* Add — elevated FAB */}
        <div className="flex flex-col items-center -mt-5">
          <button
            onClick={openAdd}
            className="w-14 h-14 rounded-full bg-black flex items-center justify-center shadow-lg transition-transform active:scale-95"
          >
            <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <BottomNavItem href="/wardrobe" label="Search" pathname={pathname}>
          <Search className="h-5 w-5" />
        </BottomNavItem>

        {/* Profile */}
        <BottomNavItem href="/profile" label="Profile" pathname={pathname}>
          <User className="h-5 w-5" />
        </BottomNavItem>
      </div>
    </nav>
  );
}

function BottomNavItem({
  href, label, pathname, children,
}: {
  href: string; label: string; pathname: string; children: React.ReactNode;
}) {
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link href={href} className="flex flex-col items-center gap-1 py-2 px-3 min-w-[3rem]">
      <span className={cn("transition", active ? "text-black" : "text-gray-300")}>
        {children}
      </span>
      <span className={cn(
        "text-[10px] leading-none",
        active ? "font-bold text-black" : "font-medium text-gray-300"
      )}>
        {label}
      </span>
    </Link>
  );
}
