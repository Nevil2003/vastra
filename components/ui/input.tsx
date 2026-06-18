import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-[#E8E8E8] bg-white px-4 py-2.5 text-sm text-[#111111]",
        "placeholder:text-[#AAAAAA] outline-none transition-all duration-200",
        "hover:border-[#CCCCCC] focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/10",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
