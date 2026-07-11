import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
  variant?: "light" | "dark";
  error?: string;
}

const InputPill = forwardRef<HTMLInputElement, Props>(function InputPill(
  { label, icon, rightElement, variant = "light", error, ...props },
  ref
) {
  const dark = variant === "dark";

  return (
    <div className="flex flex-col gap-2">
      <label className={`text-caption ${dark ? "text-white/60" : "text-ink-muted"}`}>{label}</label>
      <div className="relative">
        {icon && (
          <span
            className={`absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none ${
              dark ? "text-white/40" : "text-ink-muted"
            }`}
          >
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`w-full rounded-[56px] py-3.5 ${icon ? "pl-12" : "pl-5"} ${
            rightElement ? "pr-12" : "pr-5"
          } outline-none transition-all duration-200 focus:ring-2 ${
            dark
              ? "bg-white/[0.07] border border-white/10 text-white placeholder:text-white/25 focus:ring-white/15 focus:border-white/25"
              : `bg-surface-muted border text-ink placeholder:text-ink-muted focus:ring-brand/20 focus:border-brand focus:bg-white ${
                  error ? "border-red-400" : "border-transparent"
                }`
          }`}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </span>
        )}
      </div>
      {error && <p className="text-small text-red-500">{error}</p>}
    </div>
  );
});

export default InputPill;
