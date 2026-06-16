export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F1ED] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-widest text-[#1A1410]">VASTRA</h1>
          <p className="mt-2 text-[#2D2D2D]/70">Your AI-powered digital closet</p>
        </div>
        {children}
      </div>
    </div>
  );
}
