"use client";

import dynamic from "next/dynamic";
import { X, CircleNotch, ArrowSquareOut } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import type { Localizacao } from "../geolocation.types";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-app-surface-raised text-app-text-muted">
      <CircleNotch size={22} className="animate-spin" />
    </div>
  ),
});

interface Props {
  open: boolean;
  onClose: () => void;
  localizacao: Localizacao;
}

export default function LocationViewer({ open, onClose, localizacao }: Props) {
  const mapsLink = `https://www.google.com/maps?q=${localizacao.latitude},${localizacao.longitude}`;

  return (
    <Modal open={open} onClose={onClose} className="!max-w-4xl">
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
          <h2 className="text-feature-title text-app-text">Location</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-app-text-muted hover:text-app-text transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="h-[440px] w-full pointer-events-auto">
          <InteractiveMap
            latitude={localizacao.latitude}
            longitude={localizacao.longitude}
            onSelect={() => {}}
          />
        </div>

        <div className="px-6 py-4 border-t border-app-border flex flex-col gap-1.5">
          <p className="text-caption text-app-text-muted">Address</p>
          <p className="text-body-sm text-app-text">
            {localizacao.address ?? `${localizacao.latitude.toFixed(6)}, ${localizacao.longitude.toFixed(6)}`}
          </p>
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 text-caption font-semibold text-brand hover:underline w-fit"
          >
            <ArrowSquareOut size={14} />
            Open in Google Maps
          </a>
        </div>
      </div>
    </Modal>
  );
}
