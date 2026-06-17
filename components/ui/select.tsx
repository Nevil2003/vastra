import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237A2438' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

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
        "w-full cursor-pointer appearance-none rounded-xl border border-[#E7D9C8] bg-[#FFFDF8] py-2.5 pl-4 pr-10 text-[#241A1C]",
        "outline-none transition-all duration-200",
        "hover:border-[#D9C3A8] focus:border-[#7A2438] focus:ring-2 focus:ring-[#7A2438]/15",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
