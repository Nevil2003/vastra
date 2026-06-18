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
        "rounded-2xl border border-[#E8E8E8] bg-white p-5 shadow-sm",
        hover && "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-base font-semibold text-[#111111]", className)}>{children}</h3>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mt-4", className)}>{children}</div>;
}
