import { type InputHTMLAttributes, forwardRef } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, className = "", ...props }, ref) => {
    const input = (
      <input
        ref={ref}
        className={`
          rounded-md3-xs bg-md-surface-container-high
          px-16dp py-12dp
          text-[0.875rem] text-md-on-surface
          placeholder:text-md-on-surface-variant
          focus:bg-md-surface-container-highest
          outline-none transition-colors
          ${className}
        `}
        {...props}
      />
    );

    if (label) {
      return (
        <label className="flex flex-col gap-4dp text-[0.75rem] font-medium tracking-[0.5px] text-md-on-surface-variant">
          {label}
          {input}
        </label>
      );
    }

    return input;
  }
);
TextField.displayName = "TextField";
export default TextField;
