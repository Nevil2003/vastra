import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  asSpan?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, asSpan, children, ...props }, ref) => {
    const variants = {
      primary:
        "bg-[#3C3489] text-[#FFFDF8] shadow-sm shadow-[#3C3489]/25 hover:bg-[#2F2870] focus-visible:ring-[#3C3489]/40",
      secondary:
        "bg-[#17152D] text-[#FFFDF8] hover:bg-[#C8793D] hover:text-[#17152D] focus-visible:ring-[#C8793D]/40",
      outline:
        "border border-[#3C3489] text-[#3C3489] hover:bg-[#3C3489] hover:text-[#FFFDF8] focus-visible:ring-[#3C3489]/30",
      ghost: "text-[#211F32] hover:bg-[#E5DACB] focus-visible:ring-[#3C3489]/20",
      danger: "bg-[#B3261E] text-white hover:bg-[#8F1D17] focus-visible:ring-[#B3261E]/40",
    };

    const sizes = {
      sm: "px-3.5 py-1.5 text-sm",
      md: "px-5 py-2.5 text-base",
      lg: "px-8 py-3 text-lg",
    };

    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-full font-semibold",
      "transition-all duration-200 ease-out active:scale-[0.97]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F3EA]",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
      variants[variant],
      sizes[size],
      className
    );

    const spinner = (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80" />
    );

    if (asSpan) {
      return (
        <span className={classes}>
          {isLoading && spinner}
          {children}
        </span>
      );
    }

    return (
      <button ref={ref} className={classes} disabled={props.disabled || isLoading} {...props}>
        {isLoading && spinner}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
