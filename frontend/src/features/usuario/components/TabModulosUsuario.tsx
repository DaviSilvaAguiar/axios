"use client";

import { useEffect, useState } from "react";
import Button from "@/ui/Button";
import Switch from "@/ui/Switch";
import { toast } from "@/lib/toast";
import {
  listarModulosUsuarioApi,
  atualizarModulosUsuarioApi,
} from "@/features/modulo/modulo.api";
import type { Modulo } from "@/features/modulo/modulo.types";

interface Props {
  usuarioId: number;
}

export default function TabModulosUsuario({ usuarioId }: Props) {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [habilitados, setHabilitados] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setLoading(true);
    listarModulosUsuarioApi(usuarioId)
      .then(({ modulos: lista, habilitados: ids }) => {
        setModulos(lista);
        setHabilitados(new Set(ids));
      })
      .catch(() => toast.error("Não foi possível carregar os módulos."))
      .finally(() => setLoading(false));
  }, [usuarioId]);

  function toggle(id: number) {
    setHabilitados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSalvar() {
    setSalvando(true);
    try {
      await atualizarModulosUsuarioApi(usuarioId, Array.from(habilitados));
      toast.success("Módulos atualizados.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 animate-pulse py-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-app-surface-raised">
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-32 rounded bg-app-border" />
              <div className="h-3 w-48 rounded bg-app-border" />
            </div>
            <div className="h-6 w-11 rounded-full bg-app-border" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {modulos.map((modulo) => {
          const ativo = habilitados.has(modulo.id);
          return (
            <div
              key={modulo.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-app-border bg-app-surface-raised"
            >
              <div className="flex flex-col gap-0.5 mr-4">
                <span className="text-caption font-semibold text-app-text">{modulo.nome}</span>
                {modulo.descricao && (
                  <span className="text-small text-app-text-muted">{modulo.descricao}</span>
                )}
              </div>
              <Switch
                checked={ativo}
                onChange={() => toggle(modulo.id)}
                label={ativo ? "Desabilitar" : "Habilitar"}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="button" variant="dark" size="sm" disabled={salvando} onClick={handleSalvar}>
          {salvando ? "Salvando…" : "Salvar módulos"}
        </Button>
      </div>
    </div>
  );
}
