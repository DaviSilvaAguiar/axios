import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
  variant?: "light" | "dark";
  error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, icon, rightElement, variant = "light", error, className = "", ...props },
  ref
) {
  const dark = variant === "dark";

  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-caption font-semibold ${dark ? "text-white/60" : "text-app-text-muted"}`}>{label}</label>
      <div className="relative">
        {icon && (
          <span
            className={`absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none ${dark ? "text-white/40" : "text-ink-muted"}`}
          >
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`w-full rounded-xl py-3.5 text-body-sm ${icon ? "pl-9" : "pl-3"} ${rightElement ? "pr-9" : "pr-3"} outline-none transition-colors duration-200 ${
            dark
              ? "bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:border-white/30 focus:bg-white/15"
              : `bg-app-surface border text-app-text placeholder:text-app-text-subtle focus:border-brand ${error ? "border-red-400" : "border-app-border"}`
          }${className ? ` ${className}` : ""}`}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </span>
        )}
      </div>
      {error && <p className="text-small text-red-500">{error}</p>}
    </div>
  );
});

export default Input;
