import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border border-[#E8DDD5] bg-white px-4 py-2.5 text-[#2D2D2D] outline-none transition focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
