import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-white">
      <div className="grid-mask pointer-events-none absolute inset-0 opacity-35" />
      <header className="relative z-10 border-b border-white/[0.08] bg-black/45 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
          <Link href="/" className="flex items-center">
            <img
              src="/mastical-white-logo.svg"
              alt="Mastical"
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>
      </header>
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="mastical-glass w-full max-w-sm rounded-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
