import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  { title: "Closet", text: "Every piece you own, organized and searchable." },
  { title: "Wishlist", text: "Save what you want before you buy it." },
  { title: "Recommended", text: "Rediscover pieces you've been neglecting." },
  { title: "Profile", text: "Your sizes, measurements, and style in one place." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#111111]">
      {/* Header */}
      <header className="border-b border-[#E8E8E8]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <img
            src="/local-lookbook-logo.png"
            alt="Local Lookbook"
            className="h-9 w-auto object-contain brightness-0"
          />
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-[#888888] hover:text-[#111111] transition-colors">
              Sign in
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-4">
        <section className="flex flex-col items-center py-24 text-center">
          <p className="rounded-full border border-[#E8E8E8] px-4 py-1.5 text-sm text-[#888888]">
            Your digital closet
          </p>
          <h1 className="mt-6 max-w-2xl text-5xl font-bold leading-tight tracking-tight text-[#111111] sm:text-6xl">
            Dress with<br />confidence.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#888888]">
            Organize your wardrobe, track what you own, save what you want, and rediscover pieces you love.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">Create your closet</Button>
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
              <div key={f.title} className="rounded-2xl border border-[#E8E8E8] bg-white p-6">
                <p className="font-semibold text-[#111111]">{f.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#888888]">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E8E8] py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 text-sm text-[#AAAAAA]">
          <span className="font-medium text-[#111111]">Local Lookbook</span>
          <span>Your personal wardrobe, always with you.</span>
        </div>
      </footer>
    </div>
  );
}
