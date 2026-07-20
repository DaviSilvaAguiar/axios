"use client";

import { type Icon, Image, ImageBroken, FileX, CircleNotch } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

function AttachmentPlaceholder({ icon: PhosphorIcon, label }: { icon: Icon; label: string }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 text-app-text-subtle"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
    >
      <PhosphorIcon size={44} weight="thin" />
      <p className="text-small">{label}</p>
    </motion.div>
  );
}

interface Props {
  loadingAttachment: boolean;
  path: string | null;
  isPdf: boolean;
  isImage: boolean;
  blobUrl: string | null;
  imgError: boolean;
  description: string;
  onImgError: () => void;
}

export default function AuditAttachmentViewer({
  loadingAttachment,
  path,
  isPdf,
  isImage,
  blobUrl,
  imgError,
  description,
  onImgError,
}: Props) {
  return (
    <div className="relative flex h-80 items-center justify-center overflow-hidden border-b border-app-border bg-app-surface-raised/20">
      <AnimatePresence mode="wait">
        {loadingAttachment ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-2 text-app-text-subtle"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <CircleNotch size={32} weight="thin" />
            </motion.span>
          </motion.div>
        ) : !path ? (
          <AttachmentPlaceholder key="empty" icon={Image} label="No attachment available" />
        ) : isPdf && blobUrl ? (
          <motion.iframe
            key="pdf"
            src={blobUrl}
            className="h-full w-full"
            title="PDF attachment"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        ) : isImage && blobUrl && !imgError ? (
          <motion.img
            key="img"
            src={blobUrl}
            alt={`Attachment — ${description}`}
            className="h-full w-full object-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onError={onImgError}
          />
        ) : imgError ? (
          <AttachmentPlaceholder key="error" icon={ImageBroken} label="Could not load the attachment" />
        ) : (
          <AttachmentPlaceholder key="unsupported" icon={FileX} label="Unsupported file format" />
        )}
      </AnimatePresence>
    </div>
  );
}
