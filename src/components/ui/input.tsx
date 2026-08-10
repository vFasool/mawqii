import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-11 w-full rounded-xl2 border bg-white px-4 text-[15px] text-ink-800 placeholder:text-ink-300",
            "focus:outline-none focus:ring-2 focus:ring-emerald-600/40 focus:border-emerald-600",
            "transition-colors",
            error ? "border-red-400 focus:ring-red-400/40 focus:border-red-400" : "border-ink-200",
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
