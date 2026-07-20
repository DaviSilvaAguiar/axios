"use client";

import { motion } from "framer-motion";
import { FilePdf, CircleNotch } from "@phosphor-icons/react";
import Button from "@/ui/Button";
import { type Reimbursement } from "../../reimbursement.types";

interface Props {
  reimbursement: Reimbursement;
  loadingApprove: boolean;
  onApprove: () => void;
  onRequestReject: () => void;
  onDownloadPdf: (id: number) => Promise<void>;
}

export default function AuditFooter({ reimbursement, loadingApprove, onApprove, onRequestReject, onDownloadPdf }: Props) {
  return (
    <>
      {(reimbursement.status === 2 || reimbursement.status === 3) && (
        <div className="flex shrink-0 gap-3 border-t border-app-border bg-app-surface px-5 py-4 md:justify-end">
          <Button variant="outlined" onClick={onRequestReject} className="flex-1 md:flex-none">
            Reject Reimbursement
          </Button>
          <Button variant="dark" onClick={onApprove} disabled={loadingApprove} className="flex-1 md:flex-none">
            {loadingApprove ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <CircleNotch size={14} />
                </motion.span>
                Approving…
              </span>
            ) : (
              "Approve Reimbursement"
            )}
          </Button>
        </div>
      )}

      {reimbursement.status >= 4 && reimbursement.status !== 7 && (
        <div className="flex shrink-0 border-t border-app-border bg-app-surface px-5 py-4 md:justify-end">
          <motion.button
            onClick={() => onDownloadPdf(reimbursement.id)}
            whileHover={{ x: 3 }}
            transition={{ duration: 0.12 }}
            className="flex w-full justify-center md:w-auto cursor-pointer items-center gap-2 text-caption font-semibold text-brand hover:underline"
          >
            <FilePdf size={18} />
            Download PDF
          </motion.button>
        </div>
      )}
    </>
  );
}
