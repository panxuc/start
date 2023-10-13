import { type HTMLAttributes, forwardRef } from "react";

type Variant = "elevated" | "filled" | "outlined";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  elevated: "bg-md-surface-container-lowest shadow-md3-1",
  filled: "bg-md-surface-container-highest",
  outlined: "bg-md-surface-container-lowest border border-md-outline-variant",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "elevated", className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-md3-md p-24dp ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";
export default Card;
