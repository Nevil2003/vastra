import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E7D9C8] bg-[#FFFDF8] p-6 shadow-sm shadow-[#171012]/[0.06]",
        hover &&
          "transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#D9C3A8] hover:shadow-xl hover:shadow-[#171012]/[0.10]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("font-serif text-xl font-semibold text-[#241A1C]", className)}>{children}</h3>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mt-4", className)}>{children}</div>;
}
