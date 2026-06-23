import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-white/15 bg-white/[0.07] px-4 py-2.5 text-sm text-white",
        "placeholder:text-white/35 outline-none transition-all duration-200",
        "hover:border-white/25 focus:border-cyan-200/70 focus:ring-2 focus:ring-cyan-200/15",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
