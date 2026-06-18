export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#EEE5FF_0,#F8F3EA_24rem,#F8F3EA_100%)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-semibold tracking-widest text-[#17152D]">VASTRA</h1>
          <p className="mt-2 text-[#5F596B]">Wardrobe, outfits, stitching, and measurements</p>
        </div>
        {children}
      </div>
    </div>
  );
}
