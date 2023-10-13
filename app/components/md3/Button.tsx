import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "filled" | "filled-tonal" | "outlined" | "text";
type Size = "default" | "small";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  filled:
    "bg-md-primary text-md-on-primary",
  "filled-tonal":
    "bg-md-secondary-container text-md-on-secondary-container",
  outlined:
    "border border-md-outline text-md-primary bg-transparent",
  text:
    "text-md-primary bg-transparent",
};

const sizeClasses: Record<Size, string> = {
  default: "h-10 px-24dp text-[0.875rem]",
  small: "h-8 px-16dp text-[0.75rem]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "filled", size = "default", className = "", disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={`
        md3-state-layer inline-flex items-center justify-center gap-8dp
        rounded-md3-full font-medium tracking-[0.1px]
        transition-colors duration-md3-s4 ease-md3-standard
        disabled:opacity-50 disabled:pointer-events-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";
export default Button;
