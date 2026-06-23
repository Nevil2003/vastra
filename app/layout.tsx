import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Local Lookbook - Wardrobe, Outfits & Stitching",
  description: "A clean wardrobe operating system for outfits, occasions, tailoring, measurements, wear logs, and wishlist planning.",
  keywords: ["digital closet", "outfit planner", "wardrobe", "tailoring", "stitching", "India"],
  authors: [{ name: "Local Lookbook" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3C3489",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#F8F3EA] font-sans text-[#211F32]">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
