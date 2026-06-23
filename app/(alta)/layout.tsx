"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { AddModalProvider } from "@/lib/add-modal-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AltaLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-sm text-white/58">
        Loading...
      </div>
    );
  }

  return <AddModalProvider>{children}</AddModalProvider>;
}
