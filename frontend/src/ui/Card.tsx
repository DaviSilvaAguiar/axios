import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-2xl border border-app-border bg-app-surface shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
