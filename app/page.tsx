import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  { title: "Closet Memory", text: "Every piece you own, organized into a searchable style system." },
  { title: "Wishlist Signals", text: "Save pieces before buying so intent does not get lost." },
  { title: "Outfit Intelligence", text: "Plan looks with weather, occasions, and wear history in context." },
  { title: "Profile Layer", text: "Your sizes, measurements, and preferences as reusable fashion memory." },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="grid-mask pointer-events-none absolute inset-0 opacity-40" />
      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.08] bg-black/45 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <img
            src="/mastical-white-logo.svg"
            alt="Mastical"
            className="h-9 w-auto object-contain"
          />
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-white/62 transition-colors hover:text-white">
              Sign in
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-5xl px-4">
        <section className="flex flex-col items-center py-24 text-center">
          <p className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-white/68">
            Mastical AI Closet
          </p>
          <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-7xl">
            Fashion <span className="text-gradient">Intelligence</span><br />for your closet.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/66">
            Mastical turns wardrobe decisions, wishlist intent, outfit planning, and measurements into a reliable intelligence layer for daily style.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">Create AI Closet</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">Sign in</Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="mastical-glass rounded-lg p-6">
                <p className="font-semibold text-white">{f.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/58">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 text-sm text-white/45">
          <span className="font-medium text-white">Mastical</span>
          <span>Fashion intelligence for real-world wardrobes.</span>
        </div>
      </footer>
    </div>
  );
}
