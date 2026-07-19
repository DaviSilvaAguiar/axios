"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { FilePdf, PencilSimple, Trash, Tray } from "@phosphor-icons/react";
import EmptyState from "@/ui/EmptyState";
import StatusTag from "./StatusTag";
import { type Reimbursement, type ReimbursementStatus } from "../reimbursement.types";
import { formatarData, formatarMoeda } from "@/lib/formatters";

const COLUMNS: ReimbursementStatus[] = [1, 2, 3, 4, 5, 6, 7];

function formatAmount(reimbursement: Reimbursement): string {
  const total = (reimbursement.items ?? []).reduce((acc, d) => acc + parseFloat(d.amount), 0);
  return formatarMoeda(total);
}

interface CardProps {
  reimbursement: Reimbursement;
  isDragging?: boolean;
  onOpenAudit: (reimbursement: Reimbursement) => void;
  onDownloadPdf: (id: number) => void;
  onEditReimbursement?: (reimbursement: Reimbursement) => void;
  onDeleteReimbursement?: (reimbursement: Reimbursement) => void;
}

function ReimbursementCard({ reimbursement, isDragging, onOpenAudit, onDownloadPdf, onEditReimbursement, onDeleteReimbursement }: CardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: reimbursement.id,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm transition-shadow cursor-grab active:cursor-grabbing select-none ${isDragging ? "opacity-40" : "hover:shadow-md"
        }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-caption text-app-text font-semibold line-clamp-2 flex-1">
          {reimbursement.title}
        </p>
        <div className="flex items-center gap-0.5 shrink-0">
          {reimbursement.status === 1 && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEditReimbursement?.(reimbursement);
              }}
              title="Edit"
              className="rounded-full p-1.5 text-app-text-muted hover:bg-app-hover hover:text-brand transition-colors cursor-pointer"
            >
              <PencilSimple size={16} />
            </button>
          )}
          {reimbursement.status === 1 && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteReimbursement?.(reimbursement);
              }}
              title="Delete"
              className="rounded-full p-1.5 text-app-text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <Trash size={16} />
            </button>
          )}
          {reimbursement.status >= 4 && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDownloadPdf(reimbursement.id);
              }}
              title="Download PDF"
              className="rounded-full p-1.5 text-app-text-muted hover:bg-app-hover hover:text-brand transition-colors cursor-pointer"
            >
              <FilePdf size={16} />
            </button>
          )}
        </div>
      </div>

      <p className="text-small text-app-text-muted mb-3">
        {reimbursement.user?.name ?? "—"}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-caption text-app-text font-semibold">
          {formatAmount(reimbursement)}
        </span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onOpenAudit(reimbursement);
          }}
          className="text-small text-brand hover:underline cursor-pointer"
        >
          View details
        </button>
      </div>

      <p className="mt-2 text-small text-app-text-subtle">
        {formatarData(reimbursement.created_at)}
      </p>
    </div>
  );
}

interface ColumnProps {
  status: ReimbursementStatus;
  reimbursements: Reimbursement[];
  isDragOver: boolean;
  onOpenAudit: (reimbursement: Reimbursement) => void;
  onDownloadPdf: (id: number) => void;
  onEditReimbursement?: (reimbursement: Reimbursement) => void;
  onDeleteReimbursement?: (reimbursement: Reimbursement) => void;
  activeId: number | null;
}

function Column({ status, reimbursements, isDragOver, onOpenAudit, onDownloadPdf, onEditReimbursement, onDeleteReimbursement, activeId }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <StatusTag status={status} />
        <span className="text-small text-app-text-subtle">{reimbursements.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-24 max-h-[54rem] flex-col gap-3 overflow-y-auto rounded-2xl p-2 transition-colors ${isDragOver ? "bg-app-nav-active" : "bg-app-surface-raised/40"
          }`}
      >
        {reimbursements.map((reimbursement) => (
          <ReimbursementCard
            key={reimbursement.id}
            reimbursement={reimbursement}
            isDragging={activeId === reimbursement.id}
            onOpenAudit={onOpenAudit}
            onDownloadPdf={onDownloadPdf}
            onEditReimbursement={onEditReimbursement}
            onDeleteReimbursement={onDeleteReimbursement}
          />
        ))}
        {reimbursements.length === 0 && (
          <EmptyState icon={Tray} title="No items" size="sm" />
        )}
      </div>
    </div>
  );
}

interface KanbanViewProps {
  reimbursements: Reimbursement[];
  onMoveReimbursement: (id: number, newStatus: ReimbursementStatus) => void;
  onRequestScheduling: (reimbursement: Reimbursement) => void;
  onRequestRejection: (reimbursement: Reimbursement) => void;
  onOpenAudit: (reimbursement: Reimbursement) => void;
  onDownloadPdf: (id: number) => void;
  onEditReimbursement?: (reimbursement: Reimbursement) => void;
  onDeleteReimbursement?: (reimbursement: Reimbursement) => void;
}

export default function KanbanView({
  reimbursements,
  onMoveReimbursement,
  onRequestScheduling,
  onRequestRejection,
  onOpenAudit,
  onDownloadPdf,
  onEditReimbursement,
  onDeleteReimbursement,
}: KanbanViewProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overColumnId, setOverColumnId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeReimbursement = activeId ? reimbursements.find((r) => r.id === activeId) : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as number);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    setOverColumnId(null);
    if (!over) return;
    const reimbursementId = active.id as number;
    const newStatus = over.id as ReimbursementStatus;
    const reimbursement = reimbursements.find((r) => r.id === reimbursementId);
    if (!reimbursement || reimbursement.status === newStatus) return;
    if (newStatus === 5) {
      onRequestScheduling(reimbursement);
    } else if (newStatus === 7) {
      onRequestRejection(reimbursement);
    } else {
      onMoveReimbursement(reimbursementId, newStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={({ over }) => setOverColumnId(over ? (over.id as number) : null)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => { setActiveId(null); setOverColumnId(null); }}
    >
      <div className="flex gap-4 overflow-x-auto pt-1 pb-4">
        {COLUMNS.map((status) => (
          <Column
            key={status}
            status={status}
            reimbursements={reimbursements.filter((r) => r.status === status)}
            isDragOver={overColumnId === status}
            onOpenAudit={onOpenAudit}
            onDownloadPdf={onDownloadPdf}
            onEditReimbursement={onEditReimbursement}
            onDeleteReimbursement={onDeleteReimbursement}
            activeId={activeId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeReimbursement ? (
          <div className="w-72 rounded-2xl border border-app-border bg-app-surface p-4 shadow-2xl opacity-90">
            <p className="text-caption font-semibold text-app-text line-clamp-2 mb-1">
              {activeReimbursement.title}
            </p>
            <p className="text-small text-app-text-muted">
              {activeReimbursement.user?.name ?? "—"}
            </p>
            <p className="mt-2 text-caption font-semibold text-app-text">
              {formatAmount(activeReimbursement)}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
