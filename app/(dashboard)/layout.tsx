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
      <div className="flex min-h-screen items-center justify-center bg-white text-[#888888] text-sm">
        Loading...
      </div>
    );
  }

  return (
    <AddModalProvider>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 pt-6 pb-28 md:pb-10">{children}</main>
      </div>
    </AddModalProvider>
  );
}
