import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "Vastra - AI Digital Closet & Outfit Discovery",
  description: "India's first AI-powered digital closet. Organize your wardrobe, get daily outfit recommendations, and discover your style.",
  keywords: ["digital closet", "AI fashion", "outfit planner", "wardrobe", "India"],
  authors: [{ name: "Vastra" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#171012",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F7F0E4] font-sans text-[#241A1C]">{children}</body>
    </html>
  );
}
