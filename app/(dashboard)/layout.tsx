"use client";

import { Navbar } from "@/components/app/navbar";
import { useAuth } from "@/components/providers/auth-provider";
import { AddModalProvider } from "@/lib/add-modal-context";
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
      <div className="flex min-h-screen items-center justify-center bg-[#030306] text-sm text-white/62">
        Loading...
      </div>
    );
  }

  return (
    <AddModalProvider>
      <div className="relative min-h-screen overflow-hidden text-white">
        <div className="grid-mask pointer-events-none fixed inset-0 opacity-25" />
        <Navbar />
        <main className="relative z-10 mx-auto max-w-5xl px-4 pt-4 pb-24">{children}</main>
      </div>
    </AddModalProvider>
  );
}
