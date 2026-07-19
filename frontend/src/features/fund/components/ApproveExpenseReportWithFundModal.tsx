"use client";

import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import Button from "@/ui/Button";
import Combobox from "@/ui/Combobox";
import Loading from "@/ui/Loading";
import { toast } from "@/lib/toast";
import { formatarMoeda } from "@/lib/formatters";
import { listarCaixaContasApi } from "../caixa-conta.api";
import type { CaixaConta } from "../caixa-conta.types";

interface Props {
  idUsuarioRdc: number;
  idCentroCustoRdc: number;
  valorTotal: number;
  onConfirmar: (idCaixaConta: number) => Promise<void>;
  onFechar: () => void;
}

export default function ModalAprovarRdcComCaixa({
  idUsuarioRdc,
  idCentroCustoRdc,
  valorTotal,
  onConfirmar,
  onFechar,
}: Props) {
  const [caixas, setCaixas] = useState<CaixaConta[]>([]);
  const [loading, setLoading] = useState(true);
  const [idSelecionado, setIdSelecionado] = useState<string>("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarCaixaContasApi("abertos")
      .then((todos) => {
        // Prioriza caixas do mesmo responsável e/ou mesmo CC.
        const compativeis = todos.filter(
          (c) => c.id_usuario === idUsuarioRdc || c.id_centro_custo === idCentroCustoRdc,
        );
        setCaixas(compativeis.length > 0 ? compativeis : todos);
      })
      .catch(() => toast.error("Não foi possível carregar os caixas."))
      .finally(() => setLoading(false));
  }, [idUsuarioRdc, idCentroCustoRdc]);

  async function handleConfirmar() {
    if (!idSelecionado) return;
    setEnviando(true);
    try {
      await onConfirmar(Number(idSelecionado));
    } finally {
      setEnviando(false);
    }
  }

  const selecionado = caixas.find((c) => String(c.id) === idSelecionado);
  const saldoInsuficiente = selecionado && Number(selecionado.saldo) < valorTotal;

  return (
    <Modal open onClose={onFechar} className="max-w-md">
      <div className="px-6 py-5">
        <div className="mb-5 flex items-start justify-between">
          <h1 className="text-feature-title text-app-text">Aprovar Solicitação</h1>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full p-2 text-app-text-muted hover:bg-app-hover"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 text-body-sm text-app-text-muted">
          Selecione o caixa do qual o valor de {formatarMoeda(valorTotal)} será abatido.
        </p>

        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-caption font-semibold text-app-text-muted">
                Caixa para abatimento
              </label>
              <Combobox
                options={caixas.map((c) => ({
                  value: String(c.id),
                  label: `${c.descricao} — ${formatarMoeda(Number(c.saldo))}`,
                }))}
                value={idSelecionado}
                onChange={setIdSelecionado}
                placeholder="Selecione o caixa"
              />
            </div>

            {saldoInsuficiente && (
              <p className="text-small text-red-600">
                Saldo insuficiente neste caixa para abater o RDC.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button variant="light" fullWidth onClick={onFechar}>
            Cancelar
          </Button>
          <Button
            variant="dark"
            fullWidth
            disabled={!idSelecionado || enviando || saldoInsuficiente}
            onClick={handleConfirmar}
          >
            {enviando ? "Aprovando…" : "Aprovar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
