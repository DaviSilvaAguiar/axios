"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Gear, CaretRight } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import OffCanvas from "@/ui/OffCanvas";
import SettingsModal from "@/features/settings/components/SettingsModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OffCanvasMenu({ open, onClose }: Props) {
  const { user } = useAuth();
  const [configsOpen, setSettingsOpen] = useState(false);

  function openSettings() {
    onClose();
    setSettingsOpen(true);
  }

  return (
    <>
      <OffCanvas open={open} onClose={onClose} title={user?.name ?? ""}>
        <nav className="p-3">
          <ul className="space-y-0.5">
            <li>
              <Link
                href="/users"
                onClick={onClose}
                className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-medium text-app-text-muted hover:text-app-text hover:bg-app-hover transition-colors"
              >
                <span className="flex items-center gap-3">
                  <Users size={19} />
                  Users
                </span>
                <CaretRight size={14} className="text-app-text-subtle" />
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={openSettings}
                className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-medium text-app-text-muted hover:text-app-text hover:bg-app-hover transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <Gear size={19} />
                  Settings
                </span>
                <CaretRight size={14} className="text-app-text-subtle" />
              </button>
            </li>
          </ul>
        </nav>
      </OffCanvas>

      <SettingsModal
        open={configsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
