import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-[#E7D9C8] bg-[#FFFDF8] px-4 py-2.5 text-[#241A1C]",
        "placeholder:text-[#A89B8C] outline-none transition-all duration-200",
        "hover:border-[#D9C3A8] focus:border-[#7A2438] focus:ring-2 focus:ring-[#7A2438]/15",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
