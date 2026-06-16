import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, MessageCircle, Shirt, Sparkles, Wand2 } from "lucide-react";

const looks = [
  { name: "Sangeet Guest", pieces: "Silk kurta, ivory trousers, tan juttis", color: "#7A2438" },
  { name: "Monsoon Office", pieces: "Oxford shirt, cropped chinos, loafers", color: "#264D46" },
  { name: "Date Night", pieces: "Black dress, gold hoops, block heels", color: "#171012" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F0E4] text-[#241A1C]">
      <header className="sticky top-0 z-40 border-b border-[#E7D9C8] bg-[#F7F0E4]/88 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-[0.18em]">
            VASTRA
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-sm font-semibold text-[#241A1C]/75 hover:text-[#7A2438] sm:block">
              Sign in
            </Link>
            <Link href="/register">
              <Button size="sm">Start styling</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[1fr_0.9fr] lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E7D9C8] bg-[#FFFDF8] px-4 py-2 text-sm font-semibold text-[#7A2438] shadow-sm">
              <Sparkles className="h-4 w-4" />
              Indian closet intelligence
            </div>
            <h1 className="mt-6 max-w-3xl font-serif text-6xl font-semibold leading-[0.92] tracking-tight text-[#171012] sm:text-7xl lg:text-8xl">
              Dress like your closet has a memory.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5D5050]">
              Vastra reads your wardrobe, remembers what fits, and builds looks for office, weddings,
              monsoon days, date nights, and WhatsApp fit checks.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  <Shirt className="h-5 w-5" />
                  Build my closet
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Open atelier
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-10 h-32 w-32 rounded-full bg-[#D69A2D]/25 blur-3xl" />
            <div className="absolute -right-10 bottom-10 h-40 w-40 rounded-full bg-[#7A2438]/20 blur-3xl" />
            <div className="relative rounded-[28px] border border-[#E7D9C8] bg-[#FFFDF8] p-4 shadow-2xl shadow-[#171012]/12">
              <div className="rounded-2xl bg-[#171012] p-5 text-[#FFFDF8]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-[#D69A2D]">Today</p>
                    <h2 className="mt-1 font-serif text-3xl">3 looks ready</h2>
                  </div>
                  <Wand2 className="h-8 w-8 text-[#D69A2D]" />
                </div>
                <div className="mt-6 grid gap-3">
                  {looks.map((look) => (
                    <div key={look.name} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-14 w-14 shrink-0 rounded-xl" style={{ background: look.color }} />
                        <div>
                          <h3 className="font-semibold">{look.name}</h3>
                          <p className="mt-1 text-sm leading-5 text-white/65">{look.pieces}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#F7F0E4] p-4">
                  <CalendarDays className="h-5 w-5 text-[#7A2438]" />
                  <p className="mt-3 text-sm font-semibold">Wedding capsule</p>
                  <p className="text-xs text-[#5D5050]">Haldi to reception, from what you own.</p>
                </div>
                <div className="rounded-2xl bg-[#F7F0E4] p-4">
                  <MessageCircle className="h-5 w-5 text-[#7A2438]" />
                  <p className="mt-3 text-sm font-semibold">Fit check</p>
                  <p className="text-xs text-[#5D5050]">Share a look on WhatsApp in one tap.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
