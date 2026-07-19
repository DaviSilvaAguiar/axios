import { type ReactNode } from "react";
import ModuleGuard from "@/features/module/components/ModuleGuard";

export default function Layout({ children }: { children: ReactNode }) {
  return <ModuleGuard slug="cost-center">{children}</ModuleGuard>;
}
