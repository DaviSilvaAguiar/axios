"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import Button from "@/ui/Button";
import Combobox from "@/ui/Combobox";
import Loading from "@/ui/Loading";
import { formatarMoeda } from "@/lib/formatters";
import { useFunds } from "../fund.hooks";

interface Props {
  reportUserId: number;
  reportCostCenterId: number;
  totalAmount: number;
  onConfirm: (fundId: number) => Promise<void>;
  onClose: () => void;
}

export default function ApproveExpenseReportWithFundModal({
  reportUserId,
  reportCostCenterId,
  totalAmount,
  onConfirm,
  onClose,
}: Props) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const { data: allFunds = [], isLoading: loading } = useFunds("abertos");
  const compatible = allFunds.filter(
    (c) => c.user_id === reportUserId || c.cost_center_id === reportCostCenterId,
  );
  const funds = compatible.length > 0 ? compatible : allFunds;

  async function handleConfirm() {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await onConfirm(Number(selectedId));
    } finally {
      setSubmitting(false);
    }
  }

  const selected = funds.find((c) => String(c.id) === selectedId);
  const insufficientBalance = selected && Number(selected.balance) < totalAmount;

  return (
    <Modal open onClose={onClose} className="max-w-md">
      <div className="px-6 py-5">
        <div className="mb-5 flex items-start justify-between">
          <h1 className="text-feature-title text-app-text">Approve Request</h1>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-app-text-muted hover:bg-app-hover"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 text-body-sm text-app-text-muted">
          Select the fund the amount of {formatarMoeda(totalAmount)} will be deducted from.
        </p>

        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-caption font-semibold text-app-text-muted">
                Fund to deduct from
              </label>
              <Combobox
                options={funds.map((c) => ({
                  value: String(c.id),
                  label: `${c.description} — ${formatarMoeda(Number(c.balance))}`,
                }))}
                value={selectedId}
                onChange={setSelectedId}
                placeholder="Select the fund"
              />
            </div>

            {insufficientBalance && (
              <p className="text-small text-red-600">
                Insufficient balance in this fund to cover the report.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button variant="light" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="dark"
            fullWidth
            disabled={!selectedId || submitting || insufficientBalance}
            onClick={handleConfirm}
          >
            {submitting ? "Approving…" : "Approve"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
