"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export default function Toaster() {
  const { tema } = useTheme();
  const isDark = tema === "dark";

  return (
    <SonnerToaster
      position="top-center"
      theme={tema}
      closeButton
      gap={8}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: "!font-[inherit] !rounded-2xl",
          title: "!font-semibold !text-[13px]",
          description: "!text-xs !opacity-60",
          closeButton: "!rounded-full",
        },
      }}
      style={
        {
          "--normal-bg": isDark ? "#0a0b0d" : "#ffffff",
          "--normal-border": isDark
            ? "rgba(255, 255, 255, 0.08)"
            : "rgba(0, 0, 0, 0.08)",
          "--normal-text": isDark ? "#ffffff" : "#0a0b0d",
          "--border-radius": "14px",
          "--shadow": isDark
            ? "0 8px 40px rgba(0, 0, 0, 0.55)"
            : "0 4px 24px rgba(0, 0, 0, 0.08)",
        } as React.CSSProperties
      }
    />
  );
}
