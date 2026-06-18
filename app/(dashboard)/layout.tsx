"use client";

import { Navbar } from "@/components/app/navbar";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F3EA] text-[#857C73]">
        Opening your wardrobe...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#EEE5FF_0,#F8F3EA_24rem,#F8F3EA_100%)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 md:pb-8">{children}</main>
    </div>
  );
}
