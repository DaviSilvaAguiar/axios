"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import RejectionModal from "./RejectionModal";
import AuditHeader from "./audit/AuditHeader";
import AuditItemsPanel from "./audit/AuditItemsPanel";
import AuditDetailPanel from "./audit/AuditDetailPanel";
import AuditFooter from "./audit/AuditFooter";
import LocationViewer from "@/features/geolocation/components/LocationViewer";
import { type ReimbursementItem, type Reimbursement } from "../reimbursement.types";

const SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };

interface Props {
  reimbursement: Reimbursement;
  onClose: () => void;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number, reason: string) => Promise<void>;
  onDownloadPdf: (id: number) => Promise<void>;
}

export default function AuditView({ reimbursement, onClose, onApprove, onReject, onDownloadPdf }: Props) {
  const items = reimbursement.items ?? [];
  const [selectedItem, setSelectedItem] = useState<ReimbursementItem | null>(items[0] ?? null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"list" | "detail">("list");
  const [showLocation, setShowLocation] = useState(false);

  const total = items.reduce((acc, d) => acc + parseFloat(d.amount), 0);

  async function handleApprove() {
    setLoadingApprove(true);
    try {
      await onApprove(reimbursement.id);
    } finally {
      setLoadingApprove(false);
    }
  }

  async function handleReject(reason: string) {
    await onReject(reimbursement.id, reason);
    setShowRejectionModal(false);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-app-border bg-app-surface"
      >
        <AuditHeader reimbursement={reimbursement} onClose={onClose} />

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          <AuditItemsPanel
            reimbursement={reimbursement}
            items={items}
            selectedItem={selectedItem}
            total={total}
            mobilePanel={mobilePanel}
            onSelectItem={(item) => { setSelectedItem(item); setMobilePanel("detail"); }}
          />

          <AuditDetailPanel
            reimbursement={reimbursement}
            selectedItem={selectedItem}
            mobilePanel={mobilePanel}
            onBack={() => setMobilePanel("list")}
            onShowLocation={() => setShowLocation(true)}
          />
        </div>

        <AuditFooter
          reimbursement={reimbursement}
          loadingApprove={loadingApprove}
          onApprove={handleApprove}
          onRequestReject={() => setShowRejectionModal(true)}
          onDownloadPdf={onDownloadPdf}
        />
      </motion.div>

      {showRejectionModal && (
        <RejectionModal
          onConfirm={handleReject}
          onCancel={() => setShowRejectionModal(false)}
        />
      )}

      {selectedItem?.latitude != null && selectedItem?.longitude != null && (
        <LocationViewer
          open={showLocation}
          onClose={() => setShowLocation(false)}
          localizacao={{
            latitude: Number(selectedItem.latitude),
            longitude: Number(selectedItem.longitude),
            address: selectedItem.address ?? null,
          }}
        />
      )}
    </>
  );
}
