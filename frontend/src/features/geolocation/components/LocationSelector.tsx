"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MagnifyingGlass, Crosshair, X, CircleNotch } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import { toast } from "@/lib/toast";
import { buscarEnderecosApi, reverseGeocodeApi } from "../geolocalizacao.api";
import type { Localizacao, NominatimResult } from "../geolocalizacao.types";

const MapaInterativo = dynamic(() => import("./MapaInterativo"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-app-surface-raised text-app-text-muted">
      <CircleNotch size={22} className="animate-spin" />
    </div>
  ),
});

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirmar: (loc: Localizacao) => void;
  valorInicial?: Localizacao | null;
}

export default function SeletorLocalizacao({ open, onClose, onConfirmar, valorInicial }: Props) {
  const [latitude,  setLatitude]  = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [endereco,  setEndereco]  = useState<string>("");
  const [busca, setBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<NominatimResult[]>([]);
  const [capturando, setCapturando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLatitude(valorInicial?.latitude ?? null);
    setLongitude(valorInicial?.longitude ?? null);
    setEndereco(valorInicial?.endereco ?? "");
    setBusca("");
    setResultados([]);
  }, [open, valorInicial]);

  async function handleBuscar() {
    if (!busca.trim()) return;
    setBuscando(true);
    try {
      const res = await buscarEnderecosApi(busca);
      setResultados(res);
      if (res.length === 0) toast.info("Nenhum endereço encontrado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na busca.");
    } finally {
      setBuscando(false);
    }
  }

  function selecionarResultado(r: NominatimResult) {
    setLatitude(parseFloat(r.lat));
    setLongitude(parseFloat(r.lon));
    setEndereco(r.display_name);
    setResultados([]);
    setBusca("");
  }

  async function handleSelecionarNoMapa(lat: number, lon: number) {
    setLatitude(lat);
    setLongitude(lon);
    const enderecoResolvido = await reverseGeocodeApi(lat, lon).catch(() => null);
    if (enderecoResolvido) setEndereco(enderecoResolvido);
  }

  function handleUsarMinhaLocalizacao() {
    if (!navigator.geolocation) {
      toast.error("Seu navegador não suporta geolocalização.");
      return;
    }
    setCapturando(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        await handleSelecionarNoMapa(lat, lon);
        setCapturando(false);
      },
      (err) => {
        setCapturando(false);
        const msg = err.code === err.PERMISSION_DENIED
          ? "Permissão de localização negada."
          : "Não foi possível obter sua localização.";
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function handleConfirmar() {
    if (latitude === null || longitude === null) {
      toast.error("Selecione um ponto no mapa.");
      return;
    }
    onConfirmar({ latitude, longitude, endereco: endereco || null });
    onClose();
  }

  const podeConfirmar = latitude !== null && longitude !== null;

  return (
    <Modal open={open} onClose={onClose} className="!max-w-4xl">
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
          <h2 className="text-feature-title text-app-text">Selecionar localização</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-app-text-muted hover:text-app-text transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 border-b border-app-border space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label=""
                placeholder="Buscar por endereço, estabelecimento, cidade..."
                icon={<MagnifyingGlass size={16} />}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleBuscar();
                  }
                }}
              />
            </div>
            <Button type="button" variant="dark" onClick={handleBuscar} disabled={buscando || !busca.trim()}>
              {buscando ? "Buscando..." : "Buscar"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={handleUsarMinhaLocalizacao}
              disabled={capturando}
              title="Usar minha localização atual"
            >
              <Crosshair size={16} />
              {capturando ? "Capturando..." : "Minha localização"}
            </Button>
          </div>

          {resultados.length > 0 && (
            <ul className="max-h-40 overflow-y-auto rounded-xl border border-app-border bg-app-surface-raised divide-y divide-app-border-subtle">
              {resultados.map((r, idx) => (
                <li key={`${r.lat}-${r.lon}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => selecionarResultado(r)}
                    className="w-full text-left px-4 py-2.5 text-body-sm text-app-text hover:bg-app-hover cursor-pointer"
                  >
                    {r.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="h-[400px] w-full">
          <MapaInterativo
            latitude={latitude}
            longitude={longitude}
            onSelecionar={handleSelecionarNoMapa}
          />
        </div>

        <div className="px-6 py-4 border-t border-app-border space-y-1">
          <p className="text-caption text-app-text-muted">Endereço selecionado</p>
          <p className="text-body-sm text-app-text">
            {endereco || (latitude !== null ? `${latitude.toFixed(6)}, ${longitude?.toFixed(6)}` : "Nenhum ponto selecionado — clique no mapa, busque um endereço ou use sua localização.")}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-app-border">
          <Button type="button" variant="light" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={handleConfirmar} disabled={!podeConfirmar}>Confirmar</Button>
        </div>
      </div>
    </Modal>
  );
}
