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
        "bg-[#7A2438] text-[#FFFDF8] shadow-sm shadow-[#7A2438]/25 hover:bg-[#5E1A2A] focus-visible:ring-[#7A2438]/40",
      secondary:
        "bg-[#171012] text-[#FFFDF8] hover:bg-[#D69A2D] hover:text-[#171012] focus-visible:ring-[#D69A2D]/40",
      outline:
        "border border-[#7A2438] text-[#7A2438] hover:bg-[#7A2438] hover:text-[#FFFDF8] focus-visible:ring-[#7A2438]/30",
      ghost: "text-[#241A1C] hover:bg-[#E7D9C8] focus-visible:ring-[#7A2438]/20",
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
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F0E4]",
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
