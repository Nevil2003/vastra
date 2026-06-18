import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-[#E5DACB] bg-[#FFFDF8] px-4 py-2.5 text-[#211F32]",
        "placeholder:text-[#A89B8C] outline-none transition-all duration-200",
        "hover:border-[#D2C1AD] focus:border-[#3C3489] focus:ring-2 focus:ring-[#3C3489]/15",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
