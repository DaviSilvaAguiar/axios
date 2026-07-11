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
import { type Rcm, type RcmStatus } from "../rcm.types";
import { formatarData, formatarMoeda } from "@/lib/formatters";

const COLUNAS: RcmStatus[] = [1, 2, 3, 4, 5, 6, 7];

function formatarValor(rcm: Rcm): string {
  const total = (rcm.despesas ?? []).reduce((acc, d) => acc + parseFloat(d.valor), 0);
  return formatarMoeda(total);
}

interface CardProps {
  rcm: Rcm;
  isDragging?: boolean;
  onAbrirAuditoria: (rcm: Rcm) => void;
  onBaixarPdf: (id: number) => void;
  onEditarRcm?: (rcm: Rcm) => void;
  onExcluirRcm?: (rcm: Rcm) => void;
}

function RcmCard({ rcm, isDragging, onAbrirAuditoria, onBaixarPdf, onEditarRcm, onExcluirRcm }: CardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: rcm.id,
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
          {rcm.titulo}
        </p>
        <div className="flex items-center gap-0.5 shrink-0">
          {rcm.status === 1 && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEditarRcm?.(rcm);
              }}
              title="Editar"
              className="rounded-full p-1.5 text-app-text-muted hover:bg-app-hover hover:text-brand transition-colors cursor-pointer"
            >
              <PencilSimple size={16} />
            </button>
          )}
          {rcm.status === 1 && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onExcluirRcm?.(rcm);
              }}
              title="Excluir"
              className="rounded-full p-1.5 text-app-text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <Trash size={16} />
            </button>
          )}
          {rcm.status >= 4 && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onBaixarPdf(rcm.id);
              }}
              title="Baixar PDF"
              className="rounded-full p-1.5 text-app-text-muted hover:bg-app-hover hover:text-brand transition-colors cursor-pointer"
            >
              <FilePdf size={16} />
            </button>
          )}
        </div>
      </div>

      <p className="text-small text-app-text-muted mb-3">
        {rcm.usuario?.nome ?? "—"}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-caption text-app-text font-semibold">
          {formatarValor(rcm)}
        </span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onAbrirAuditoria(rcm);
          }}
          className="text-small text-brand hover:underline cursor-pointer"
        >
          Ver detalhes
        </button>
      </div>

      <p className="mt-2 text-small text-app-text-subtle">
        {formatarData(rcm.created_at)}
      </p>
    </div>
  );
}

interface ColunaProps {
  status: RcmStatus;
  rcms: Rcm[];
  isDragOver: boolean;
  onAbrirAuditoria: (rcm: Rcm) => void;
  onBaixarPdf: (id: number) => void;
  onEditarRcm?: (rcm: Rcm) => void;
  onExcluirRcm?: (rcm: Rcm) => void;
  activeId: number | null;
}

function Coluna({ status, rcms, isDragOver, onAbrirAuditoria, onBaixarPdf, onEditarRcm, onExcluirRcm, activeId }: ColunaProps) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <StatusTag status={status} />
        <span className="text-small text-app-text-subtle">{rcms.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-24 max-h-[54rem] flex-col gap-3 overflow-y-auto rounded-2xl p-2 transition-colors ${isDragOver ? "bg-app-nav-active" : "bg-app-surface-raised/40"
          }`}
      >
        {rcms.map((rcm) => (
          <RcmCard
            key={rcm.id}
            rcm={rcm}
            isDragging={activeId === rcm.id}
            onAbrirAuditoria={onAbrirAuditoria}
            onBaixarPdf={onBaixarPdf}
            onEditarRcm={onEditarRcm}
            onExcluirRcm={onExcluirRcm}
          />
        ))}
        {rcms.length === 0 && (
          <EmptyState icon={Tray} title="Sem itens" size="sm" />
        )}
      </div>
    </div>
  );
}

interface KanbanViewProps {
  rcms: Rcm[];
  onMoverRcm: (id: number, novoStatus: RcmStatus) => void;
  onPedirAgendamento: (rcm: Rcm) => void;
  onPedirRejeicao: (rcm: Rcm) => void;
  onAbrirAuditoria: (rcm: Rcm) => void;
  onBaixarPdf: (id: number) => void;
  onEditarRcm?: (rcm: Rcm) => void;
  onExcluirRcm?: (rcm: Rcm) => void;
}

export default function KanbanView({
  rcms,
  onMoverRcm,
  onPedirAgendamento,
  onPedirRejeicao,
  onAbrirAuditoria,
  onBaixarPdf,
  onEditarRcm,
  onExcluirRcm,
}: KanbanViewProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overColumnId, setOverColumnId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeRcm = activeId ? rcms.find((r) => r.id === activeId) : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as number);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    setOverColumnId(null);
    if (!over) return;
    const rcmId = active.id as number;
    const novoStatus = over.id as RcmStatus;
    const rcm = rcms.find((r) => r.id === rcmId);
    if (!rcm || rcm.status === novoStatus) return;
    if (novoStatus === 5) {
      onPedirAgendamento(rcm);
    } else if (novoStatus === 7) {
      onPedirRejeicao(rcm);
    } else {
      onMoverRcm(rcmId, novoStatus);
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
        {COLUNAS.map((status) => (
          <Coluna
            key={status}
            status={status}
            rcms={rcms.filter((r) => r.status === status)}
            isDragOver={overColumnId === status}
            onAbrirAuditoria={onAbrirAuditoria}
            onBaixarPdf={onBaixarPdf}
            onEditarRcm={onEditarRcm}
            onExcluirRcm={onExcluirRcm}
            activeId={activeId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeRcm ? (
          <div className="w-72 rounded-2xl border border-app-border bg-app-surface p-4 shadow-2xl opacity-90">
            <p className="text-caption font-semibold text-app-text line-clamp-2 mb-1">
              {activeRcm.titulo}
            </p>
            <p className="text-small text-app-text-muted">
              {activeRcm.usuario?.nome ?? "—"}
            </p>
            <p className="mt-2 text-caption font-semibold text-app-text">
              {formatarValor(activeRcm)}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
