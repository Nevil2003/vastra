import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mastical AI Closet - Fashion Intelligence",
  description: "Mastical AI Closet is a fashion intelligence system for wardrobes, outfits, occasions, measurements, wear logs, and wishlist planning.",
  keywords: ["Mastical", "AI Closet", "fashion intelligence", "digital closet", "outfit planner", "wardrobe", "tailoring"],
  authors: [{ name: "Mastical" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030306",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#030306] font-sans text-[#F7FBFF]">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
