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
        "mastical-glass rounded-2xl p-5",
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
    <h3 className={cn("text-base font-semibold text-white", className)}>{children}</h3>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mt-4", className)}>{children}</div>;
}
