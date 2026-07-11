"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Gear, CaretRight } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import OffCanvas from "@/ui/OffCanvas";
import ConfiguracoesModal from "@/features/config/components/ConfiguracoesModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OffCanvasMenu({ open, onClose }: Props) {
  const { usuario } = useAuth();
  const [configsOpen, setConfigsOpen] = useState(false);

  function abrirConfiguracoes() {
    onClose();
    setConfigsOpen(true);
  }

  return (
    <>
      <OffCanvas open={open} onClose={onClose} title={usuario?.nome ?? ""}>
        <nav className="p-3">
          <ul className="space-y-0.5">
            <li>
              <Link
                href="/usuarios"
                onClick={onClose}
                className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-medium text-app-text-muted hover:text-app-text hover:bg-app-hover transition-colors"
              >
                <span className="flex items-center gap-3">
                  <Users size={19} />
                  Usuários
                </span>
                <CaretRight size={14} className="text-app-text-subtle" />
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={abrirConfiguracoes}
                className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-medium text-app-text-muted hover:text-app-text hover:bg-app-hover transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <Gear size={19} />
                  Configurações
                </span>
                <CaretRight size={14} className="text-app-text-subtle" />
              </button>
            </li>
          </ul>
        </nav>
      </OffCanvas>

      <ConfiguracoesModal
        open={configsOpen}
        onClose={() => setConfigsOpen(false)}
      />
    </>
  );
}
