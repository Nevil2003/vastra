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
        "bg-[#111111] text-white hover:bg-[#333333] focus-visible:ring-[#111111]/40",
      secondary:
        "bg-[#F5F5F5] text-[#111111] hover:bg-[#E8E8E8] focus-visible:ring-[#111111]/20",
      outline:
        "border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white focus-visible:ring-[#111111]/30",
      ghost: "text-[#111111] hover:bg-[#F0F0F0] focus-visible:ring-[#111111]/20",
      danger: "bg-[#EF4444] text-white hover:bg-[#DC2626] focus-visible:ring-[#EF4444]/40",
    };

    const sizes = {
      sm: "px-3.5 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-8 py-3 text-base",
    };

    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-full font-medium",
      "transition-all duration-200 ease-out active:scale-[0.97]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAFA]",
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
