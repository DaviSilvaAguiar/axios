"use client";

import { useState, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CaretUpDown, Check, MagnifyingGlass, X } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface Props {
  options: readonly ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export default function Combobox({
  options,
  value,
  onChange,
  placeholder = "Selecione…",
  searchPlaceholder = "Buscar…",
  emptyMessage = "Nenhum resultado.",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, search]);

  function handleSelect(optValue: string) {
    onChange(optValue === value ? "" : optValue);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(""); }}>
      <Popover.Trigger asChild>
        <button
          className={`flex h-12 items-center gap-2 rounded-xl border px-3 text-small font-semibold transition-colors ${
            open
              ? "border-brand bg-app-surface text-app-text"
              : value
              ? "border-brand/40 bg-app-surface text-app-text"
              : "border-app-border bg-app-surface text-app-text-muted hover:border-brand/50"
          } ${className}`}
        >
          <span className="flex-1 truncate text-left">
            {selected ? selected.label : placeholder}
          </span>

          {value ? (
            <span
              role="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onChange("");
                setOpen(false);
              }}
              className="rounded-full p-0.5 text-app-text-muted hover:bg-app-hover hover:text-app-text"
            >
              <X size={12} weight="bold" />
            </span>
          ) : (
            <CaretUpDown size={14} className="shrink-0 text-app-text-subtle" />
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={6}
          className="z-50 w-56 outline-none"
        >
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.14 }}
            className="overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-xl"
          >
            {/* Search */}
            <div className="flex items-center gap-2 border-b border-app-border px-3 py-2.5">
              <MagnifyingGlass size={14} className="shrink-0 text-app-text-subtle" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-body-sm text-app-text placeholder:text-app-text-subtle outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-app-text-subtle hover:text-app-text">
                  <X size={12} weight="bold" />
                </button>
              )}
            </div>

            {/* List */}
            <ul className="max-h-60 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-small text-app-text-muted text-center">
                  {emptyMessage}
                </li>
              ) : (
                filtered.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <li key={opt.value}>
                      <button
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(opt.value)}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-small font-semibold transition-colors ${
                          isSelected
                            ? "bg-app-nav-active text-brand"
                            : "text-app-text hover:bg-app-hover"
                        }`}
                      >
                        <span className="flex-1 text-left">{opt.label}</span>
                        {isSelected && <Check size={13} weight="bold" className="shrink-0 text-brand" />}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
