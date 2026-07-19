"use client";

import { useState, useRef, useEffect, CSSProperties } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { CalendarBlank, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  align?: "left" | "right";
  className?: string;
}

function isoToDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateToIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function DatePicker({
  label = "",
  value,
  onChange,
  onBlur,
  error,
  placeholder = "DD/MM/YYYY",
  disabled,
  size = "md",
  align = "left",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  function updatePosition() {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPopoverStyle({
      position: "fixed",
      top: rect.bottom + 8,
      ...(align === "right"
        ? { right: window.innerWidth - rect.right }
        : { left: rect.left }),
      zIndex: 9999,
    });
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const inContainer = containerRef.current?.contains(e.target as Node);
      const inPopover = popoverRef.current?.contains(e.target as Node);
      if (!inContainer && !inPopover) {
        setOpen(false);
        onBlur?.();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onBlur]);

  useEffect(() => {
    if (!open) return;
    function handleScrollOrResize() {
      setOpen(false);
    }
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open]);

  function handleToggle() {
    if (open) {
      setOpen(false);
    } else {
      updatePosition();
      setOpen(true);
    }
  }

  function handleSelect(day: Date | undefined) {
    if (!day) return;
    onChange(dateToIso(day));
    setOpen(false);
    onBlur?.();
  }

  const selected = isoToDate(value);
  const isCompact = size === "sm";

  const currentYear = new Date().getFullYear();
  const startMonth = new Date(1970, 0);
  const endMonth = new Date(currentYear + 10, 11);

  const popover = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          style={popoverStyle}
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="rounded-2xl border border-app-border bg-app-surface p-3 shadow-xl"
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            locale={ptBR}
            captionLayout="dropdown"
            startMonth={startMonth}
            endMonth={endMonth}
            classNames={{
              root: "text-body-sm text-app-text",
              month_caption: "flex justify-between items-center mb-3 px-1",
              caption_label: "text-caption font-semibold text-app-text hidden",
              dropdowns: "flex gap-2",
              dropdown: "rounded-xl border border-app-border bg-app-surface-raised px-2 py-1 text-small font-semibold text-app-text focus:outline-none focus:border-brand cursor-pointer",
              nav: "flex gap-1",
              button_previous: "flex h-7 w-7 items-center justify-center rounded-full hover:bg-app-hover text-app-text-muted transition-colors",
              button_next: "flex h-7 w-7 items-center justify-center rounded-full hover:bg-app-hover text-app-text-muted transition-colors",
              weeks: "border-t border-app-border-subtle pt-2",
              weekdays: "flex",
              weekday: "w-8 text-center text-small text-app-text-subtle py-1",
              week: "flex",
              day: "w-8 h-8",
              day_button: "w-8 h-8 rounded-full text-small font-semibold flex items-center justify-center transition-colors hover:bg-app-hover text-app-text focus:outline-none",
              today: "text-brand font-bold",
              selected: "bg-brand text-white rounded-full [&>button]:hover:bg-[#578bfa] [&>button]:text-white",
              outside: "opacity-30",
              disabled: "opacity-30 cursor-not-allowed",
              range_start: "bg-brand/10 rounded-l-full",
              range_end: "bg-brand/10 rounded-r-full",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-caption font-semibold text-app-text-muted">
          {label}
        </label>
      )}

      <div
        ref={buttonRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : handleToggle}
        onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) handleToggle(); }}
        className={`flex items-center gap-2 rounded-xl border text-left transition-colors w-full ${isCompact ? "px-3 h-12 min-w-[128px]" : "rounded-2xl px-4 py-3.5"
          } ${error
            ? "border-red-400 bg-app-surface"
            : open
              ? "border-brand bg-app-surface"
              : "border-app-border bg-app-surface hover:border-brand/50"
          } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      >
        <CalendarBlank
          size={isCompact ? 14 : 16}
          weight="bold"
          className={open ? "text-brand" : "text-app-text-subtle"}
        />
        <span className={`flex-1 ${isCompact ? "text-small" : "text-body-sm"} ${value ? "text-app-text" : "text-app-text-subtle"}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        {value && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setOpen(false);
              onBlur?.();
            }}
            className="text-app-text-subtle hover:text-app-text transition-colors"
            tabIndex={-1}
            aria-label="Clear date"
          >
            <X size={isCompact ? 12 : 14} weight="bold" />
          </button>
        )}
      </div>

      {error && <p className="text-small text-red-600">{error}</p>}

      {typeof window !== "undefined" && createPortal(popover, document.body)}
    </div>
  );
}
