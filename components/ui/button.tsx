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
      primary: "bg-[#7A2438] text-[#FFFDF8] shadow-sm shadow-[#7A2438]/20 hover:bg-[#5E1A2A]",
      secondary: "bg-[#171012] text-[#FFFDF8] hover:bg-[#D69A2D] hover:text-[#171012]",
      outline: "border border-[#7A2438] text-[#7A2438] hover:bg-[#7A2438] hover:text-[#FFFDF8]",
      ghost: "text-[#241A1C] hover:bg-[#E7D9C8]",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-base",
      lg: "px-8 py-3 text-lg",
    };

    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:opacity-50",
      variants[variant],
      sizes[size],
      className
    );

    if (asSpan) {
      return (
        <span className={classes}>
          {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          {children}
        </span>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={props.disabled || isLoading}
        {...props}
      >
        {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
