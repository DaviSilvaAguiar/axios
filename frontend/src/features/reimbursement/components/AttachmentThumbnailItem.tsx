"use client";

import { useEffect, useState } from "react";
import { Eye } from "@phosphor-icons/react";
import { getAnexoEspecificoReimbursementApi } from "../reimbursement.api";

interface AttachmentThumbnailProps {
  reimbursementId: number;
  itemId: number;
  attachmentId: number;
  path: string;
  onOpen: () => void;
}

export default function AttachmentThumbnailItem({ reimbursementId, itemId, attachmentId, path, onOpen }: AttachmentThumbnailProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isImage = /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(path);

  useEffect(() => {
    let url: string;
    getAnexoEspecificoReimbursementApi(reimbursementId, itemId, attachmentId)
      .then((blob) => {
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch(() => setSrc(null))
      .finally(() => setLoading(false));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [reimbursementId, itemId, attachmentId]);

  const baseClass =
    "group relative h-16 w-16 rounded-xl shrink-0 border border-app-border overflow-hidden cursor-pointer transition";

  if (loading) {
    return <div className={`${baseClass} animate-pulse bg-app-surface-raised`} />;
  }

  if (isImage && src) {
    return (
      <button onClick={onOpen} className={`${baseClass} p-0`} type="button">
        <img src={src} alt="Attachment" className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
          <Eye size={18} weight="bold" className="text-white" />
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onOpen}
      className={`${baseClass} bg-app-surface-raised flex items-center justify-center hover:bg-app-surface-raised-hover`}
      type="button"
    >
      <Eye size={20} className="text-app-text-muted" />
    </button>
  );
}
