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
import { type Rdc, type RdcStatus } from "../rdc.types";
import { formatarData, formatarMoeda } from "@/lib/formatters";

const COLUNAS: RdcStatus[] = [1, 2, 3, 4, 5, 6, 7];

const TRANSICOES_VALIDAS: Record<RdcStatus, RdcStatus[]> = {
  1: [2],          // Rascunho → Pendente
  2: [1, 3, 4, 7], // Pendente → Rascunho | Em Análise | Aprovado | Rejeitado
  3: [2, 4, 7],    // Em Análise → Pendente | Aprovado | Rejeitado
  4: [5],          // Aprovado → Pagamento Agendado
  5: [6],          // Pagamento Agendado → Pago
  6: [],           // Pago → trancado
  7: [],           // Rejeitado → trancado
};

function formatarValor(rdc: Rdc): string {
  const total = (rdc.despesas ?? []).reduce(
    (acc, d) => acc + parseFloat(d.valor ?? "0"),
    0
  );
  return formatarMoeda(total);
}

interface CardProps {
  rdc: Rdc;
  isDragging?: boolean;
  onAbrir: (rdc: Rdc) => void;
  onEditarRdc?: (rdc: Rdc) => void;
  onExcluirRdc?: (rdc: Rdc) => void;
  onBaixarPdf?: (id: number) => void;
}

function RdcCard({ rdc, isDragging, onAbrir, onEditarRdc, onExcluirRdc, onBaixarPdf }: CardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: rdc.id,
  });
  const [hoverMotivo, setHoverMotivo] = useState(false);

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
          {rdc.descricao}
        </p>
        {rdc.status === 1 && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEditarRdc?.(rdc);
              }}
              title="Editar"
              className="rounded-full p-1.5 text-app-text-muted hover:bg-app-hover hover:text-brand transition-colors cursor-pointer"
            >
              <PencilSimple size={16} />
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onExcluirRdc?.(rdc);
              }}
              title="Excluir"
              className="rounded-full p-1.5 text-app-text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <Trash size={16} />
            </button>
          </div>
        )}

        {rdc.status >= 4 && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onBaixarPdf?.(rdc.id);
            }}
            title="Baixar PDF"
            className="shrink-0 rounded-full p-1.5 text-app-text-muted hover:bg-app-hover hover:text-brand transition-colors cursor-pointer"
          >
            <FilePdf size={16} />
          </button>
        )}

        {rdc.status === 7 && (
          rdc.motivo_rejeicao ? (
            <Popover.Root open={hoverMotivo} onOpenChange={setHoverMotivo}>
              <Popover.Trigger asChild>
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseEnter={() => setHoverMotivo(true)}
                  onMouseLeave={() => setHoverMotivo(false)}
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
                  onMouseEnter={() => setHoverMotivo(true)}
                  onMouseLeave={() => setHoverMotivo(false)}
                  className="z-50 max-w-[220px] rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 px-3 py-2 shadow-lg"
                >
                  <p className="text-small font-semibold text-red-700 dark:text-red-300 mb-1">Motivo da Rejeição</p>
                  <p className="text-small text-red-600 dark:text-red-400 break-words whitespace-pre-line">
                    {rdc.motivo_rejeicao.length > 120
                      ? rdc.motivo_rejeicao.slice(0, 120) + "…"
                      : rdc.motivo_rejeicao}
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
        {rdc.descricao_requisitante}
      </p>

      <p className="text-small text-app-text-subtle mb-3">
        {rdc.setor_requisitante}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-caption text-app-text font-semibold">
          {formatarValor(rdc)}
        </span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onAbrir(rdc);
          }}
          className="text-small text-brand hover:underline cursor-pointer"
        >
          Ver detalhes
        </button>
      </div>

      <p className="mt-2 text-small text-app-text-subtle">
        {formatarData(rdc.data_inicio_periodo ?? rdc.data_necessidade)}
      </p>
    </div>
  );
}

const MENSAGEM_INVALIDA: Record<RdcStatus, string> = {
  1: "RDC ja finalizado",
  2: "Submeta o RDC pelos detalhes",
  3: "Precisa estar Pendente antes",
  4: "Precisa passar pela analise antes",
  5: "Aprove o RDC antes",
  6: "Agende o pagamento antes",
  7: "Precisa passar pela analise antes",
};

interface ColunaProps {
  status: RdcStatus;
  rdcs: Rdc[];
  isDragOver: boolean;
  isDropAlvoInvalido: boolean;
  onAbrir: (rdc: Rdc) => void;
  onEditarRdc?: (rdc: Rdc) => void;
  onExcluirRdc?: (rdc: Rdc) => void;
  onBaixarPdf?: (id: number) => void;
  activeId: number | null;
}

function Coluna({ status, rdcs, isDragOver, isDropAlvoInvalido, onAbrir, onEditarRdc, onExcluirRdc, onBaixarPdf, activeId }: ColunaProps) {
  const { setNodeRef } = useDroppable({ id: status });
  const mostrarBloqueio = isDragOver && isDropAlvoInvalido;

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <StatusTag status={status} />
        <span className="text-small text-app-text-subtle">{rdcs.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`relative flex min-h-24 max-h-[54rem] flex-col gap-3 overflow-y-auto rounded-2xl p-2 transition-colors ${mostrarBloqueio
          ? "bg-red-50 ring-1 ring-red-300 dark:bg-red-950/40 dark:ring-red-900"
          : isDragOver
            ? "bg-app-nav-active"
            : "bg-app-surface-raised/40"
          }`}
      >
        {rdcs.map((rdc) => (
          <RdcCard
            key={rdc.id}
            rdc={rdc}
            isDragging={activeId === rdc.id}
            onAbrir={onAbrir}
            onEditarRdc={onEditarRdc}
            onExcluirRdc={onExcluirRdc}
            onBaixarPdf={onBaixarPdf}
          />
        ))}
        {rdcs.length === 0 && !mostrarBloqueio && (
          <EmptyState icon={Tray} title="Sem itens" size="sm" />
        )}
        {mostrarBloqueio && (
          <div className="pointer-events-none absolute inset-2 flex flex-col items-center justify-center gap-2 rounded-xl bg-red-50/95 text-red-700 dark:bg-red-950/80 dark:text-red-300">
            <Prohibit size={28} weight="bold" />
            <p className="px-3 text-center text-small font-semibold">
              {MENSAGEM_INVALIDA[status]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface KanbanViewProps {
  rdcs: Rdc[];
  onMoverRdc: (id: number, novoStatus: RdcStatus) => void;
  onSelecionarRdc: (rdc: Rdc) => void;
  onEditarRdc?: (rdc: Rdc) => void;
  onExcluirRdc?: (rdc: Rdc) => void;
  onBaixarPdf?: (id: number) => void;
}

export default function KanbanView({ rdcs, onMoverRdc, onSelecionarRdc, onEditarRdc, onExcluirRdc, onBaixarPdf }: KanbanViewProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overColumnId, setOverColumnId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeRdc = activeId ? rdcs.find((r) => r.id === activeId) : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as number);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    setOverColumnId(null);
    if (!over) return;
    const rdcId = active.id as number;
    const novoStatus = over.id as RdcStatus;
    const rdc = rdcs.find((r) => r.id === rdcId);
    if (!rdc || rdc.status === novoStatus) return;
    if (!TRANSICOES_VALIDAS[rdc.status].includes(novoStatus)) return;
    onMoverRdc(rdcId, novoStatus);
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
        {COLUNAS.map((status) => {
          const isDropAlvoInvalido = activeRdc
            ? activeRdc.status !== status && !TRANSICOES_VALIDAS[activeRdc.status].includes(status)
            : false;
          return (
            <Coluna
              key={status}
              status={status}
              rdcs={rdcs.filter((r) => r.status === status)}
              isDragOver={overColumnId === status}
              isDropAlvoInvalido={isDropAlvoInvalido}
              onAbrir={onSelecionarRdc}
              onEditarRdc={onEditarRdc}
              onExcluirRdc={onExcluirRdc}
              onBaixarPdf={onBaixarPdf}
              activeId={activeId}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeRdc ? (
          <div className="w-72 rounded-2xl border border-app-border bg-app-surface p-4 shadow-2xl opacity-90">
            <p className="text-caption font-semibold text-app-text line-clamp-2 mb-1">
              {activeRdc.descricao}
            </p>
            <p className="text-small text-app-text-muted">
              {activeRdc.descricao_requisitante}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
