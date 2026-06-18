import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, NotebookText, Ruler, Shirt } from "lucide-react";

const cards = [
  { title: "Wardrobe", text: "Clothes, fabrics, photos, prices, and wear count.", icon: Shirt },
  { title: "Stitching", text: "Tailor status, trial dates, due dates, and measurements.", icon: Ruler },
  { title: "Occasions", text: "Plan outfits for weddings, work, travel, and festivals.", icon: CalendarDays },
  { title: "Wear log", text: "Track repeats, cost per wear, and underused pieces.", icon: NotebookText },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#211F32]">
      <header className="border-b border-[#E5DACB] bg-[#FFFDF8]/88 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-[0.18em]">
            VASTRA
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-semibold text-[#211F32]/75 hover:text-[#3C3489] sm:block">
              Sign in
            </Link>
            <Link href="/signup">
              <Button size="sm">Start free</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[1fr_0.95fr]">
        <section>
          <div className="inline-flex rounded-full border border-[#E5DACB] bg-[#FFFDF8] px-4 py-2 text-sm font-semibold text-[#3C3489]">
            Wardrobe, outfits, stitching, and measurements
          </div>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl font-semibold leading-[0.95] text-[#17152D] sm:text-7xl">
            Your closet should remember everything.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5F596B]">
            Vastra is a clean fashion utility for the clothes you own, the outfits you plan,
            the fabrics you need stitched, and the measurements you never want to lose.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">Create my closet</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">Open Vastra</Button>
            </Link>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#E5DACB] bg-[#FFFDF8] p-4 shadow-2xl shadow-[#17152D]/10">
          <div className="rounded-3xl bg-[#17152D] p-5 text-[#FFFDF8]">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#F4DFB5]">Today</p>
            <h2 className="mt-2 font-serif text-3xl">Wedding blouse trial due</h2>
            <p className="mt-2 text-sm leading-6 text-white/68">Pick up from Meera Tailors by 6 PM. Attach it to the reception outfit after trial.</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {cards.map((card) => (
              <div key={card.title} className="rounded-2xl bg-[#F8F3EA] p-4">
                <card.icon className="h-5 w-5 text-[#3C3489]" />
                <p className="mt-3 font-semibold">{card.title}</p>
                <p className="mt-1 text-sm leading-5 text-[#5F596B]">{card.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
