import { type ReactNode } from "react";
import ModuloGuard from "@/features/modulo/components/ModuloGuard";

export default function Layout({ children }: { children: ReactNode }) {
  return <ModuloGuard slug="categoria">{children}</ModuloGuard>;
}
