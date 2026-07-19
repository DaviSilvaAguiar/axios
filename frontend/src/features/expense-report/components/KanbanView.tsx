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
import { FilePdf, PencilSimple, Prohibit, Trash, Tray, WarningCircle } from "@phosphor-icons/react";
import * as Popover from "@radix-ui/react-popover";
import EmptyState from "@/ui/EmptyState";
import StatusTag from "./StatusTag";
import { type ExpenseReport, type ExpenseReportStatus } from "../expense-report.types";
import { formatarData, formatarMoeda } from "@/lib/formatters";

const COLUMNS: ExpenseReportStatus[] = [1, 2, 3, 4, 5, 6, 7];

const VALID_TRANSITIONS: Record<ExpenseReportStatus, ExpenseReportStatus[]> = {
  1: [2],
  2: [1, 3, 4, 7],
  3: [2, 4, 7],
  4: [5],
  5: [6],
  6: [],
  7: [],
};

function formatTotal(expenseReport: ExpenseReport): string {
  const total = (expenseReport.items ?? []).reduce(
    (acc, d) => acc + parseFloat(d.amount ?? "0"),
    0
  );
  return formatarMoeda(total);
}

interface CardProps {
  expenseReport: ExpenseReport;
  isDragging?: boolean;
  onOpen: (expenseReport: ExpenseReport) => void;
  onEditExpenseReport?: (expenseReport: ExpenseReport) => void;
  onDeleteExpenseReport?: (expenseReport: ExpenseReport) => void;
  onDownloadPdf?: (id: number) => void;
}

function ExpenseReportCard({ expenseReport, isDragging, onOpen, onEditExpenseReport, onDeleteExpenseReport, onDownloadPdf }: CardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: expenseReport.id,
  });
  const [hoverReason, setHoverReason] = useState(false);

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
          {expenseReport.description}
        </p>
        {expenseReport.status === 1 && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEditExpenseReport?.(expenseReport);
              }}
              title="Edit"
              className="rounded-full p-1.5 text-app-text-muted hover:bg-app-hover hover:text-brand transition-colors cursor-pointer"
            >
              <PencilSimple size={16} />
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteExpenseReport?.(expenseReport);
              }}
              title="Delete"
              className="rounded-full p-1.5 text-app-text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <Trash size={16} />
            </button>
          </div>
        )}

        {expenseReport.status >= 4 && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDownloadPdf?.(expenseReport.id);
            }}
            title="Download PDF"
            className="shrink-0 rounded-full p-1.5 text-app-text-muted hover:bg-app-hover hover:text-brand transition-colors cursor-pointer"
          >
            <FilePdf size={16} />
          </button>
        )}

        {expenseReport.status === 7 && (
          expenseReport.rejection_reason ? (
            <Popover.Root open={hoverReason} onOpenChange={setHoverReason}>
              <Popover.Trigger asChild>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseEnter={() => setHoverReason(true)}
                  onMouseLeave={() => setHoverReason(false)}
                  className="shrink-0 rounded-full p-1 text-red-400 hover:text-red-600 transition-colors cursor-default"
                >
                  <WarningCircle size={16} weight="fill" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="top"
                  align="end"
                  sideOffset={4}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onMouseEnter={() => setHoverReason(true)}
                  onMouseLeave={() => setHoverReason(false)}
                  className="z-50 max-w-[220px] rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 px-3 py-2 shadow-lg"
                >
                  <p className="text-small font-semibold text-red-700 dark:text-red-300 mb-1">Rejection Reason</p>
                  <p className="text-small text-red-600 dark:text-red-400 break-words whitespace-pre-line">
                    {expenseReport.rejection_reason.length > 120
                      ? expenseReport.rejection_reason.slice(0, 120) + "…"
                      : expenseReport.rejection_reason}
                  </p>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          ) : (
            <span className="shrink-0 p-1 text-app-text-subtle">
              <WarningCircle size={16} weight="fill" />
            </span>
          )
        )}
      </div>

      <p className="text-small text-app-text-muted mb-1">
        {expenseReport.requester_description}
      </p>

      <p className="text-small text-app-text-subtle mb-3">
        {expenseReport.requester_department}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-caption text-app-text font-semibold">
          {formatTotal(expenseReport)}
        </span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onOpen(expenseReport);
          }}
          className="text-small text-brand hover:underline cursor-pointer"
        >
          View details
        </button>
      </div>

      <p className="mt-2 text-small text-app-text-subtle">
        {formatarData(expenseReport.period_start_date ?? expenseReport.needed_at)}
      </p>
    </div>
  );
}

const INVALID_MESSAGE: Record<ExpenseReportStatus, string> = {
  1: "Report already finalized",
  2: "Submit the report from its details",
  3: "It must be Pending first",
  4: "It must go through review first",
  5: "Approve the report first",
  6: "Schedule the payment first",
  7: "It must go through review first",
};

interface ColumnProps {
  status: ExpenseReportStatus;
  rdcs: ExpenseReport[];
  isDragOver: boolean;
  isInvalidDropTarget: boolean;
  onOpen: (expenseReport: ExpenseReport) => void;
  onEditExpenseReport?: (expenseReport: ExpenseReport) => void;
  onDeleteExpenseReport?: (expenseReport: ExpenseReport) => void;
  onDownloadPdf?: (id: number) => void;
  activeId: number | null;
}

function Column({ status, rdcs, isDragOver, isInvalidDropTarget, onOpen, onEditExpenseReport, onDeleteExpenseReport, onDownloadPdf, activeId }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });
  const showBlock = isDragOver && isInvalidDropTarget;

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <StatusTag status={status} />
        <span className="text-small text-app-text-subtle">{rdcs.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`relative flex min-h-24 max-h-[54rem] flex-col gap-3 overflow-y-auto rounded-2xl p-2 transition-colors ${showBlock
          ? "bg-red-50 ring-1 ring-red-300 dark:bg-red-950/40 dark:ring-red-900"
          : isDragOver
            ? "bg-app-nav-active"
            : "bg-app-surface-raised/40"
          }`}
      >
        {rdcs.map((expenseReport) => (
          <ExpenseReportCard
            key={expenseReport.id}
            expenseReport={expenseReport}
            isDragging={activeId === expenseReport.id}
            onOpen={onOpen}
            onEditExpenseReport={onEditExpenseReport}
            onDeleteExpenseReport={onDeleteExpenseReport}
            onDownloadPdf={onDownloadPdf}
          />
        ))}
        {rdcs.length === 0 && !showBlock && (
          <EmptyState icon={Tray} title="No items" size="sm" />
        )}
        {showBlock && (
          <div className="pointer-events-none absolute inset-2 flex flex-col items-center justify-center gap-2 rounded-xl bg-red-50/95 text-red-700 dark:bg-red-950/80 dark:text-red-300">
            <Prohibit size={28} weight="bold" />
            <p className="px-3 text-center text-small font-semibold">
              {INVALID_MESSAGE[status]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface KanbanViewProps {
  rdcs: ExpenseReport[];
  onMoveExpenseReport: (id: number, newStatus: ExpenseReportStatus) => void;
  onSelectExpenseReport: (expenseReport: ExpenseReport) => void;
  onEditExpenseReport?: (expenseReport: ExpenseReport) => void;
  onDeleteExpenseReport?: (expenseReport: ExpenseReport) => void;
  onDownloadPdf?: (id: number) => void;
}

export default function KanbanView({ rdcs, onMoveExpenseReport, onSelectExpenseReport, onEditExpenseReport, onDeleteExpenseReport, onDownloadPdf }: KanbanViewProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overColumnId, setOverColumnId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeExpenseReport = activeId ? rdcs.find((r) => r.id === activeId) : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as number);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    setOverColumnId(null);
    if (!over) return;
    const rdcId = active.id as number;
    const newStatus = over.id as ExpenseReportStatus;
    const expenseReport = rdcs.find((r) => r.id === rdcId);
    if (!expenseReport || expenseReport.status === newStatus) return;
    if (!VALID_TRANSITIONS[expenseReport.status].includes(newStatus)) return;
    onMoveExpenseReport(rdcId, newStatus);
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
        {COLUMNS.map((status) => {
          const isInvalidDropTarget = activeExpenseReport
            ? activeExpenseReport.status !== status && !VALID_TRANSITIONS[activeExpenseReport.status].includes(status)
            : false;
          return (
            <Column
              key={status}
              status={status}
              rdcs={rdcs.filter((r) => r.status === status)}
              isDragOver={overColumnId === status}
              isInvalidDropTarget={isInvalidDropTarget}
              onOpen={onSelectExpenseReport}
              onEditExpenseReport={onEditExpenseReport}
              onDeleteExpenseReport={onDeleteExpenseReport}
              onDownloadPdf={onDownloadPdf}
              activeId={activeId}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeExpenseReport ? (
          <div className="w-72 rounded-2xl border border-app-border bg-app-surface p-4 shadow-2xl opacity-90">
            <p className="text-caption font-semibold text-app-text line-clamp-2 mb-1">
              {activeExpenseReport.description}
            </p>
            <p className="text-small text-app-text-muted">
              {activeExpenseReport.requester_description}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
