import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "light" | "dark" | "outlined" | "brand";
type Size    = "md" | "sm";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClass: Record<Variant, string> = {
  light:    "btn-pill-light",
  dark:     "btn-pill-dark",
  outlined: "btn-pill-outlined",
  brand:    "btn-pill-brand",
};

export default function Button({
  variant = "dark",
  size = "md",
  fullWidth,
  children,
  className = "",
  ...props
}: Props) {
  const sizeOverride = size === "sm" ? " !py-[10px] !px-5 !text-[14px]" : "";

  return (
    <button
      className={`btn-pill ${variantClass[variant]}${sizeOverride}${fullWidth ? " w-full" : ""}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
