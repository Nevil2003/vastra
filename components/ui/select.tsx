import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238eeeff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      style={{
        backgroundImage: CHEVRON,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.85rem center",
      }}
      className={cn(
        "w-full cursor-pointer appearance-none rounded-xl border border-white/15 bg-white/[0.07] py-2.5 pl-4 pr-10 text-sm text-white",
        "outline-none transition-all duration-200",
        "hover:border-white/25 focus:border-cyan-200/70 focus:ring-2 focus:ring-cyan-200/15",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
